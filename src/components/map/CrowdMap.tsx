'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { type Map as MLMap, type LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { CrowdPressure, Facility, GeoPoint, Incident, Zone } from '@/lib/data/types';

// Matches the `risk` scale in tailwind.config.ts — kept in sync manually
// since MapLibre layer paint expressions need literal color strings, not
// Tailwind classes.
const RISK_COLORS: Record<CrowdPressure['level'], string> = {
  NORMAL: '#2e9b5c',
  BUILDING: '#d98a2b',
  CRITICAL: '#e0563a',
  INTERVENTION: '#b23a2e'
};

const FACILITY_COLORS: Record<string, string> = {
  MEDICAL: '#e11d48',
  POLICE: '#2563eb',
  FIRE: '#f97316',
  TOILET: '#0ea5e9',
  WATER_POINT: '#06b6d4',
  PARKING: '#8b5cf6',
  BRIDGE: '#94a3b8',
  ROAD: '#64748b',
  GHAT: '#22c55e',
  LIGHTING: '#eab308',
  WASTE_BIN: '#78716c',
  INFO_DISPLAY: '#a3a3a3'
};

export interface CrowdMapProps {
  zones: { zone: Zone; pressure: CrowdPressure }[];
  facilities?: Facility[];
  incidents?: Incident[];
  center?: GeoPoint;
  zoom?: number;
  onZoneClick?: (zoneId: string) => void;
  className?: string;
}

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
  layers: [
    { id: 'osm-tiles', type: 'raster', source: 'osm', paint: { 'raster-opacity': 0.9, 'raster-saturation': -0.25, 'raster-brightness-min': 0.35 } }
  ]
};

export function CrowdMap({ zones, facilities = [], incidents = [], center = { lat: 25.4305, lng: 81.8809 }, zoom = 14, onZoneClick, className }: CrowdMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [center.lng, center.lat] as LngLatLike,
      zoom,
      attributionControl: { compact: true }
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const draw = () => {
      // Zone polygons
      const zoneFeatures = {
        type: 'FeatureCollection' as const,
        features: zones.map(({ zone, pressure }) => ({
          type: 'Feature' as const,
          properties: { id: zone.id, name: zone.name, score: pressure.score, level: pressure.level, color: RISK_COLORS[pressure.level] },
          geometry: { type: 'Polygon' as const, coordinates: [[...zone.boundary.map((p) => [p.lng, p.lat]), [zone.boundary[0]!.lng, zone.boundary[0]!.lat]]] }
        }))
      };

      if (map.getSource('zones')) {
        (map.getSource('zones') as maplibregl.GeoJSONSource).setData(zoneFeatures as any);
      } else {
        map.addSource('zones', { type: 'geojson', data: zoneFeatures as any });
        map.addLayer({ id: 'zones-fill', type: 'fill', source: 'zones', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.35 } });
        map.addLayer({ id: 'zones-line', type: 'line', source: 'zones', paint: { 'line-color': ['get', 'color'], 'line-width': 1.5 } });
        map.addLayer({
          id: 'zones-label',
          type: 'symbol',
          source: 'zones',
          layout: { 'text-field': ['get', 'name'], 'text-size': 11, 'text-anchor': 'center' },
          paint: { 'text-color': '#1a1a1a', 'text-halo-color': '#fffdec', 'text-halo-width': 1.4 }
        });

        map.on('click', 'zones-fill', (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const props = f.properties as any;
          new maplibregl.Popup({ closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:sans-serif;font-size:12px;color:#111"><strong>${props.name}</strong><br/>Risk: ${props.level} (score ${props.score})</div>`)
            .addTo(map);
          onZoneClick?.(props.id);
        });
        map.on('mouseenter', 'zones-fill', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'zones-fill', () => (map.getCanvas().style.cursor = ''));
      }

      // Facility markers
      const facilityFeatures = {
        type: 'FeatureCollection' as const,
        features: facilities.map((f) => ({
          type: 'Feature' as const,
          properties: { name: f.name, category: f.category, color: FACILITY_COLORS[f.category] ?? '#a3a3a3' },
          geometry: { type: 'Point' as const, coordinates: [f.location.lng, f.location.lat] }
        }))
      };
      if (map.getSource('facilities')) {
        (map.getSource('facilities') as maplibregl.GeoJSONSource).setData(facilityFeatures as any);
      } else {
        map.addSource('facilities', { type: 'geojson', data: facilityFeatures as any, cluster: true, clusterRadius: 30 });
        map.addLayer({
          id: 'facility-clusters',
          type: 'circle',
          source: 'facilities',
          filter: ['has', 'point_count'],
          paint: { 'circle-color': '#f7f6ee', 'circle-radius': 12, 'circle-stroke-width': 1, 'circle-stroke-color': '#a3a199' }
        });
        map.addLayer({
          id: 'facility-cluster-count',
          type: 'symbol',
          source: 'facilities',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 10 },
          paint: { 'text-color': '#1a1a1a' }
        });
        map.addLayer({
          id: 'facility-points',
          type: 'circle',
          source: 'facilities',
          filter: ['!', ['has', 'point_count']],
          paint: { 'circle-color': ['get', 'color'], 'circle-radius': 5, 'circle-stroke-width': 1, 'circle-stroke-color': '#fffdec' }
        });
      }

      // Incident markers
      const incidentFeatures = {
        type: 'FeatureCollection' as const,
        features: incidents
          .filter((i) => i.status !== 'RESOLVED')
          .map((i) => ({
            type: 'Feature' as const,
            properties: { type: i.type, severity: i.severity },
            geometry: { type: 'Point' as const, coordinates: [i.location.lng, i.location.lat] }
          }))
      };
      if (map.getSource('incidents')) {
        (map.getSource('incidents') as maplibregl.GeoJSONSource).setData(incidentFeatures as any);
      } else {
        map.addSource('incidents', { type: 'geojson', data: incidentFeatures as any });
        map.addLayer({
          id: 'incident-points',
          type: 'circle',
          source: 'incidents',
          paint: {
            'circle-color': '#c62828',
            'circle-radius': 7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });
      }
    };

    if (map.isStyleLoaded()) draw();
    else map.once('load', draw);
  }, [zones, facilities, incidents, onZoneClick]);

  return <div ref={containerRef} className={className ?? 'h-full w-full'} />;
}
