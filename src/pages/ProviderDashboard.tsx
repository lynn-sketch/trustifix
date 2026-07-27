import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";
import {
  BOOKING_STATUS_LABELS,
  canTransition,
  type BookingStatus,
} from "../lib/booking";
import { formatUGX } from "../lib/format";

const PROVIDER_ACTIONS: BookingStatus[] = [
  "accepted",
  "en_route",
  "in_progress",
  "completed",
  "cancelled",
];

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const { bookingsForProvider, updateBookingStatus, getBalanceCents, threadForBooking } =
    usePlatform();

  const jobs = useMemo(
    () => (user ? bookingsForProvider(user.id) : []),
    [bookingsForProvider, user],
  );

  const balance = user ? getBalanceCents(user.id) : 0;

  return (
    <div>
      <Navbar />
      <main className="tf-page">
        <header className="tf-page-header">
          <h1>Provider jobs</h1>
          <p className="tf-muted">
            Accept requests, update job status, earn payouts on completion. Wallet:{" "}
            <strong>{formatUGX(balance)}</strong>
          </p>
        </header>

        {jobs.length === 0 ? (
          <div className="tf-card" style={{ padding: "1.5rem" }}>
            <p>No jobs yet. When customers book you, they appear here.</p>
            <p className="tf-muted">
              Tip: sign in as <strong>Demo Provider (Alex Okello)</strong>, then book him from a
              customer account in another session — or book Alex while signed in as customer, then
              switch to provider to manage the job.
            </p>
          </div>
        ) : (
          <div className="tf-stack">
            {jobs.map((job) => {
              const actions = PROVIDER_ACTIONS.filter((s) => canTransition(job.status, s));
              return (
                <article key={job.id} className="tf-card tf-booking-card">
                  <div className="tf-booking-top">
                    <div>
                      <strong>{job.serviceCategory}</strong>
                      <div className="tf-muted">{job.locationLabel}</div>
                      {job.notes && <p>{job.notes}</p>}
                      {job.scheduledAt && (
                        <div className="tf-muted">
                          Scheduled: {new Date(job.scheduledAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <span className="tf-badge">{BOOKING_STATUS_LABELS[job.status]}</span>
                  </div>

                  <div className="tf-chip-row">
                    {threadForBooking(job.id) && (
                      <Link
                        className="tf-chip tf-chip-active"
                        to={`/messages?thread=${threadForBooking(job.id)!.id}`}
                      >
                        Open chat
                      </Link>
                    )}
                    {actions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className="tf-btn tf-btn-primary"
                        onClick={() => updateBookingStatus(job.id, status)}
                      >
                        {BOOKING_STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
