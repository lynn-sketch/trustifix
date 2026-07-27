export type KampalaArea = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

/** Common Kampala / greater Kampala pins for “near me” */
export const KAMPALA_AREAS: KampalaArea[] = [
  { id: "nakawa", name: "Nakawa", lat: 0.34, lng: 32.615 },
  { id: "ntinda", name: "Ntinda", lat: 0.353, lng: 32.615 },
  { id: "kololo", name: "Kololo", lat: 0.333, lng: 32.592 },
  { id: "bugolobi", name: "Bugolobi", lat: 0.318, lng: 32.62 },
  { id: "makerere", name: "Makerere", lat: 0.335, lng: 32.57 },
  { id: "bukoto", name: "Bukoto", lat: 0.348, lng: 32.59 },
  { id: "muyenga", name: "Muyenga", lat: 0.3, lng: 32.61 },
  { id: "entebbe-rd", name: "Entebbe Rd", lat: 0.29, lng: 32.58 },
  { id: "naalya", name: "Naalya", lat: 0.365, lng: 32.63 },
  { id: "kampala-cbd", name: "Kampala CBD", lat: 0.313, lng: 32.581 },
];

export const DEFAULT_AREA = KAMPALA_AREAS[0];

export function nearestArea(lat: number, lng: number): KampalaArea {
  let best = KAMPALA_AREAS[0];
  let bestD = Number.POSITIVE_INFINITY;
  for (const a of KAMPALA_AREAS) {
    const dLat = a.lat - lat;
    const dLng = a.lng - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}
