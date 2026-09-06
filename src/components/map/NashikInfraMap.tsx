'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { NASHIK_CENTER, NASHIK_LAYERS, loadNashikLayer, type NashikLayer } from './nashikLayers';

// Real Nashik/Trimbakeshwar Kumbh infrastructure, rendered as toggleable
// layers. Each dataset gets fill/line/point sublayers filtered on geometry
// type, so files holding mixed geometry (ghats: polygons + markers + a line)
// need no special-casing — the approach is taken from the upstream Nashik
// Monitor project (see nashikLayers.ts for attribution).
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm', paint: { 'raster-opacity': 0.9, 'raster-saturation': -0.2, 'raster-brightness-min': 0.35 } }]
};

// The layers switched on at first paint — the ones someone at the mela needs
// most, kept few so the map opens readable rather than as a wall of dots.
const DEFAULT_ON = ['ghats', 'hospitals', 'public-toilets', 'police-stations'];

function confidenceNote(props: Record<string, unknown>): string {
  const raw = (props.locationConfidence ?? props.geocodeConfidence) as string | undefined;
  if (!raw) return '';
  const map: Record<string, string> = {
    verified: '✅ Verified position',
    'locality-match': '≈ Placed by locality name, not surveyed',
    approximate: '≈ Approximate — near city centre only',
    indicative: '≈ Indicative, not an inventory',
    HIGH: '≈ Graded HIGH by source (not surveyed)',
    MEDIUM: '≈ Graded MEDIUM by source (not surveyed)',
    LOW: '≈ Graded LOW by source (not surveyed)'
  };
  return `<div style="margin-top:4px;color:#78766f">${map[raw] ?? raw}</div>`;
}

export function NashikInfraMap({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [active, setActive] = useState<string[]>(DEFAULT_ON);
  const [failed, setFailed] = useState<string[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [NASHIK_CENTER.lng, NASHIK_CENTER.lat],
      zoom: 11.5,
      attributionControl: { compact: true }
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = async () => {
      for (const layer of NASHIK_LAYERS) {
        const shouldShow = active.includes(layer.id);
        const sourceId = `nashik-${layer.id}`;
        const ids = [`${sourceId}-fill`, `${sourceId}-line`, `${sourceId}-point`];

        if (!shouldShow) {
          for (const id of ids) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
          continue;
        }

        if (map.getSource(sourceId)) {
          for (const id of ids) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible');
          continue;
        }

        try {
          const data = await loadNashikLayer(layer);
          if (!mapRef.current) return;
          map.addSource(sourceId, { type: 'geojson', data: data as never });
          map.addLayer({
            id: `${sourceId}-fill`,
            type: 'fill',
            source: sourceId,
            filter: ['==', ['geometry-type'], 'Polygon'],
            paint: { 'fill-color': layer.color, 'fill-opacity': 0.25 }
          });
          map.addLayer({
            id: `${sourceId}-line`,
            type: 'line',
            source: sourceId,
            filter: ['in', ['geometry-type'], ['literal', ['LineString', 'Polygon']]],
            paint: { 'line-color': layer.color, 'line-width': 2 }
          });
          map.addLayer({
            id: `${sourceId}-point`,
            type: 'circle',
            source: sourceId,
            filter: ['==', ['geometry-type'], 'Point'],
            paint: { 'circle-radius': 5, 'circle-color': layer.color, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fffdec' }
          });

          for (const id of [`${sourceId}-fill`, `${sourceId}-point`]) {
            map.on('click', id, (e) => {
              const f = e.features?.[0];
              if (!f) return;
              const props = (f.properties ?? {}) as Record<string, unknown>;
              const name = (props.name ?? props.Name ?? props.title ?? layer.label) as string;
              new maplibregl.Popup({ closeButton: true, maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(
                  `<div style="font-family:sans-serif;font-size:12px;color:#1a1a1a">
                     <div style="font-weight:700">${layer.emoji} ${name}</div>
                     <div style="color:#78766f">${layer.label}</div>
                     ${confidenceNote(props)}
                   </div>`
                )
                .addTo(map);
            });
            map.on('mouseenter', id, () => (map.getCanvas().style.cursor = 'pointer'));
            map.on('mouseleave', id, () => (map.getCanvas().style.cursor = ''));
          }
        } catch {
          setFailed((f) => (f.includes(layer.id) ? f : [...f, layer.id]));
        }
      }
    };

    if (map.isStyleLoaded()) void sync();
    else map.once('load', () => void sync());
  }, [active]);

  function toggle(id: string) {
    setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {NASHIK_LAYERS.map((layer) => {
          const on = active.includes(layer.id);
          const broke = failed.includes(layer.id);
          return (
            <button
              key={layer.id}
              onClick={() => toggle(layer.id)}
              title={broke ? 'Could not load this layer' : layer.caveat}
              className={`fast-transition flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
                on ? 'border-transparent text-white' : 'border-paper-border bg-paper-surface text-paper-muted'
              } ${broke ? 'opacity-40' : ''}`}
              style={on ? { backgroundColor: layer.color } : undefined}
            >
              <span aria-hidden="true">{layer.emoji}</span>
              {layer.label}
            </button>
          );
        })}
      </div>
      <div ref={containerRef} className="h-[62vh] overflow-hidden rounded-lg border border-paper-border" />
      <p className="mt-2 text-[11px] leading-snug text-paper-faint">
        Infrastructure data: Nashik Monitor by Tanmay K (Kumbhathon Innovation Foundation), AGPL-3.0, used with permission. Positions vary in accuracy —
        tap any feature to see how its location was established.
      </p>
    </div>
  );
}
