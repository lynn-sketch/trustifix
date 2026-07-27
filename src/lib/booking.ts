export type BookingStatus =
  | "pending"
  | "accepted"
  | "en_route"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type Booking = {
  id: string;
  customerId: string;
  providerId?: string;
  serviceCategory: string;
  status: BookingStatus;
  scheduledAt?: string;
  locationLabel: string;
  notes?: string;
  priceHoldCents?: number;
  createdAt: string;
  updatedAt: string;
};

/** Allowed status transitions for Phase 1 booking lifecycle */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["en_route", "cancelled", "disputed"],
  en_route: ["in_progress", "cancelled", "disputed"],
  in_progress: ["completed", "disputed", "cancelled"],
  completed: ["disputed"],
  cancelled: [],
  disputed: ["completed", "cancelled"],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[from].includes(to);
}

export function transitionBooking(booking: Booking, next: BookingStatus): Booking {
  if (!canTransition(booking.status, next)) {
    throw new Error(`Invalid booking transition: ${booking.status} → ${next}`);
  }
  return {
    ...booking,
    status: next,
    updatedAt: new Date().toISOString(),
  };
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending acceptance",
  accepted: "Accepted",
  en_route: "Provider en route",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "In dispute",
};
