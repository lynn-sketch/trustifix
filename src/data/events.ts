export type CommunityEvent = {
  id: string;
  title: string;
  summary: string;
  place: string;
  startsAt: string;
  endsAt: string;
  category: "Workshop" | "Meetup" | "Training" | "Community";
  capacity: number;
  host: string;
};

export const EVENTS: CommunityEvent[] = [
  {
    id: "evt-ac-clinic",
    title: "Mobile AC Clinic · Nakawa",
    summary: "Live demos on leak tests, gas refill safety, and fair pricing for vehicle AC jobs.",
    place: "Nakawa Market parking · Kampala",
    startsAt: "2026-08-02T09:00:00",
    endsAt: "2026-08-02T13:00:00",
    category: "Workshop",
    capacity: 40,
    host: "Alex Okello",
  },
  {
    id: "evt-provider-onboarding",
    title: "Provider onboarding & verification day",
    summary: "Bring ID and a sample portfolio. Admins review applications on the spot.",
    place: "TrustiFix Hub · Bugolobi",
    startsAt: "2026-08-09T10:00:00",
    endsAt: "2026-08-09T15:00:00",
    category: "Training",
    capacity: 60,
    host: "TrustiFix Ops",
  },
  {
    id: "evt-home-safety",
    title: "Home electrical safety meetup",
    summary: "Sockets, water heaters, and when to call a verified electrician.",
    place: "Kololo Community Hall",
    startsAt: "2026-08-16T14:00:00",
    endsAt: "2026-08-16T17:00:00",
    category: "Meetup",
    capacity: 35,
    host: "Brian Mutebi",
  },
  {
    id: "evt-drivers-brief",
    title: "Airport drivers briefing",
    summary: "Fixed quotes, tracked trips, and customer chat etiquette for TrustiFix drivers.",
    place: "Entebbe Rd meetup point",
    startsAt: "2026-08-23T08:30:00",
    endsAt: "2026-08-23T11:00:00",
    category: "Community",
    capacity: 25,
    host: "James Ssempiira",
  },
];

export function getEvent(id: string): CommunityEvent | undefined {
  return EVENTS.find((e) => e.id === id);
}
