const EARTH_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in km */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** Project lat/lng into 0–100 SVG viewBox percentages for Kampala-ish bounds */
export function projectToMap(
  point: { lat: number; lng: number },
  bounds = { minLat: 0.275, maxLat: 0.365, minLng: 32.55, maxLng: 32.64 },
): { x: number; y: number } {
  const x =
    ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y =
    (1 - (point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(96, Math.max(4, y)),
  };
}
