import type { GeoPoint } from '@/lib/data/types';

const EARTH_RADIUS_M = 6371000;

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function nearest<T>(from: GeoPoint, items: T[], getLocation: (item: T) => GeoPoint): { item: T; distanceMeters: number } | null {
  let best: { item: T; distanceMeters: number } | null = null;
  for (const item of items) {
    const distanceMeters = haversineMeters(from, getLocation(item));
    if (!best || distanceMeters < best.distanceMeters) {
      best = { item, distanceMeters };
    }
  }
  return best;
}
