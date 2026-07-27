import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { providerLabel, usePlatform } from "../contexts/PlatformContext";
import {
  BOOKING_STATUS_LABELS,
  canTransition,
  type BookingStatus,
} from "../lib/booking";
import { formatUGX } from "../lib/format";

const FLOW: BookingStatus[] = [
  "pending",
  "accepted",
  "en_route",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
];

export function DashboardPage() {
  const { user } = useAuth();
  const {
    bookingsForCustomer,
    updateBookingStatus,
    openDispute,
    addReview,
    reviews,
    threadForBooking,
  } = usePlatform();
  const [disputeReason, setDisputeReason] = useState<Record<string, string>>({});
  const [reviewDraft, setReviewDraft] = useState<Record<string, { rating: number; comment: string }>>(
    {},
  );

  const bookings = useMemo(
    () => (user ? bookingsForCustomer(user.id) : []),
    [bookingsForCustomer, user],
  );

  return (
    <div>
      <Navbar />
      <main className="tf-page">
        <header className="tf-page-header">
          <h1>My bookings</h1>
          <p className="tf-muted">Track jobs, leave reviews, or open a dispute.</p>
          <Link to="/services" className="tf-btn tf-btn-primary">
            Book another provider
          </Link>
        </header>

        {bookings.length === 0 ? (
          <div className="tf-card" style={{ padding: "1.5rem" }}>
            <p>No bookings yet.</p>
            <Link to="/services">Find a provider →</Link>
          </div>
        ) : (
          <div className="tf-stack">
            {bookings.map((booking) => {
              const reviewed = reviews.some((r) => r.bookingId === booking.id);
              const next = FLOW.filter((s) => canTransition(booking.status, s));
              const draft = reviewDraft[booking.id] ?? { rating: 5, comment: "" };

              return (
                <article key={booking.id} className="tf-card tf-booking-card">
                  <div className="tf-booking-top">
                    <div>
                      <strong>{booking.serviceCategory}</strong>
                      <div className="tf-muted">
                        {providerLabel(booking.providerId)} · {booking.locationLabel}
                      </div>
                      {booking.notes && <p>{booking.notes}</p>}
                    </div>
                    <span className="tf-badge">{BOOKING_STATUS_LABELS[booking.status]}</span>
                  </div>

                  <ol className="tf-timeline">
                    {FLOW.filter((s) => s !== "cancelled" && s !== "disputed").map((status) => (
                      <li
                        key={status}
                        data-active={booking.status === status}
                        data-done={
                          FLOW.indexOf(booking.status) >= FLOW.indexOf(status) &&
                          booking.status !== "cancelled" &&
                          booking.status !== "disputed"
                        }
                      >
                        {BOOKING_STATUS_LABELS[status]}
                      </li>
                    ))}
                  </ol>

                  <div className="tf-chip-row">
                    {booking.priceHoldCents != null && (
                      <span className="tf-chip">{formatUGX(booking.priceHoldCents)} held</span>
                    )}
                    {threadForBooking(booking.id) && (
                      <Link
                        className="tf-chip tf-chip-active"
                        to={`/messages?thread=${threadForBooking(booking.id)!.id}`}
                      >
                        Open chat
                      </Link>
                    )}
                  </div>

                  {user && next.includes("cancelled") && (
                    <button
                      type="button"
                      className="tf-btn tf-btn-secondary"
                      onClick={() => updateBookingStatus(booking.id, "cancelled")}
                    >
                      Cancel & refund
                    </button>
                  )}

                  {user && canTransition(booking.status, "disputed") && (
                    <div className="tf-inline-form">
                      <input
                        placeholder="Dispute reason"
                        value={disputeReason[booking.id] ?? ""}
                        onChange={(e) =>
                          setDisputeReason((prev) => ({ ...prev, [booking.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="tf-btn tf-btn-secondary"
                        onClick={() => {
                          const reason = disputeReason[booking.id]?.trim();
                          if (!reason) return;
                          openDispute(booking.id, user.id, reason);
                        }}
                      >
                        Open dispute
                      </button>
                    </div>
                  )}

                  {booking.status === "completed" && !reviewed && booking.providerId && user && (
                    <div className="tf-inline-form" style={{ flexDirection: "column", alignItems: "stretch" }}>
                      <strong>Leave a review</strong>
                      <select
                        value={draft.rating}
                        onChange={(e) =>
                          setReviewDraft((prev) => ({
                            ...prev,
                            [booking.id]: { ...draft, rating: Number(e.target.value) },
                          }))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} stars
                          </option>
                        ))}
                      </select>
                      <textarea
                        rows={3}
                        placeholder="How did it go?"
                        value={draft.comment}
                        onChange={(e) =>
                          setReviewDraft((prev) => ({
                            ...prev,
                            [booking.id]: { ...draft, comment: e.target.value },
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="tf-btn tf-btn-primary"
                        onClick={() => {
                          if (!draft.comment.trim() || !booking.providerId) return;
                          addReview({
                            bookingId: booking.id,
                            providerId: booking.providerId,
                            customerId: user.id,
                            rating: draft.rating,
                            comment: draft.comment.trim(),
                          });
                        }}
                      >
                        Submit review
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
