import { Navbar } from "../components/Navbar";
import { displayName, providerLabel, usePlatform } from "../contexts/PlatformContext";
import { BOOKING_STATUS_LABELS } from "../lib/booking";

export function AdminPage() {
  const {
    bookings,
    disputes,
    reviews,
    safetyAlerts,
    acknowledgeSafetyAlert,
    applications,
    reviewApplication,
    getEffectiveProviders,
    setProviderVerification,
    clearPersistedData,
  } = usePlatform();

  const providers = getEffectiveProviders();
  const pendingApps = applications.filter((a) => a.status === "pending");

  return (
    <div>
      <Navbar />
      <main className="tf-page">
        <header className="tf-page-header">
          <h1>Admin console</h1>
          <p className="tf-muted">Safety · verification · disputes · bookings</p>
          <button
            type="button"
            className="tf-btn tf-btn-secondary"
            onClick={() => {
              if (confirm("Reset all local TrustiFix data?")) clearPersistedData();
            }}
          >
            Reset local data
          </button>
        </header>

        <div className="tf-stat-row">
          <div className="tf-card tf-stat">
            <div className="tf-muted">Bookings</div>
            <strong>{bookings.length}</strong>
          </div>
          <div className="tf-card tf-stat">
            <div className="tf-muted">Pending apps</div>
            <strong>{pendingApps.length}</strong>
          </div>
          <div className="tf-card tf-stat">
            <div className="tf-muted">Panic alerts</div>
            <strong>{safetyAlerts.filter((a) => a.status === "open").length}</strong>
          </div>
          <div className="tf-card tf-stat">
            <div className="tf-muted">Reviews</div>
            <strong>{reviews.length}</strong>
          </div>
        </div>

        <section style={{ marginTop: "2rem" }}>
          <h2>Provider applications</h2>
          {applications.length === 0 ? (
            <p className="tf-muted">No applications yet.</p>
          ) : (
            <div className="tf-stack">
              {applications.map((a) => (
                <article key={a.id} className="tf-card" style={{ padding: "1rem" }}>
                  <div className="tf-chip-row" style={{ marginBottom: "0.5rem" }}>
                    <span className="tf-badge">{a.status}</span>
                    <span className="tf-chip">{a.category}</span>
                  </div>
                  <strong>{a.fullName}</strong>
                  <div className="tf-muted">{a.area}</div>
                  <p>{a.pitch}</p>
                  {a.status === "pending" && (
                    <div className="tf-chip-row">
                      <button
                        type="button"
                        className="tf-btn tf-btn-primary"
                        onClick={() => reviewApplication(a.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="tf-btn tf-btn-secondary"
                        onClick={() => reviewApplication(a.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginTop: "2rem" }}>
          <h2>Provider verification badges</h2>
          <div className="tf-stack">
            {providers.map((p) => (
              <article key={p.id} className="tf-card tf-txn-row">
                <div>
                  <strong>{p.name}</strong>
                  <div className="tf-muted">{p.area}</div>
                  <div className="tf-chip-row" style={{ marginTop: "0.35rem" }}>
                    {p.verified ? (
                      <span className="tf-badge">Verified</span>
                    ) : (
                      <span className="tf-chip">Unverified</span>
                    )}
                    {p.phoneVerified ? (
                      <span className="tf-badge">Phone</span>
                    ) : (
                      <span className="tf-chip">No phone</span>
                    )}
                  </div>
                </div>
                <div className="tf-chip-row">
                  <button
                    type="button"
                    className="tf-btn tf-btn-secondary"
                    onClick={() => setProviderVerification(p.id, { verified: !p.verified })}
                  >
                    Toggle verified
                  </button>
                  <button
                    type="button"
                    className="tf-btn tf-btn-secondary"
                    onClick={() =>
                      setProviderVerification(p.id, { phoneVerified: !p.phoneVerified })
                    }
                  >
                    Toggle phone
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "2rem" }}>
          <h2>Safety alerts</h2>
          {safetyAlerts.length === 0 ? (
            <p className="tf-muted">No panic alerts yet.</p>
          ) : (
            <div className="tf-stack">
              {safetyAlerts.map((a) => (
                <article key={a.id} className="tf-card tf-safety-card">
                  <div>
                    <strong className={a.status === "open" ? "tf-danger-text" : ""}>
                      {a.status === "open" ? "OPEN · " : ""}
                      {displayName(a.userId)}
                    </strong>
                    <p>{a.note}</p>
                    <p className="tf-muted">
                      {a.areaLabel} · {a.lat.toFixed(3)}, {a.lng.toFixed(3)} ·{" "}
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {a.status === "open" && (
                    <button
                      type="button"
                      className="tf-btn tf-btn-primary"
                      onClick={() => acknowledgeSafetyAlert(a.id)}
                    >
                      Acknowledge
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginTop: "2rem" }}>
          <h2>Requires attention</h2>
          {disputes.length === 0 ? (
            <p className="tf-muted">No disputes yet.</p>
          ) : (
            <div className="tf-stack">
              {disputes.map((d) => {
                const booking = bookings.find((b) => b.id === d.bookingId);
                return (
                  <article key={d.id} className="tf-card" style={{ padding: "1rem" }}>
                    <strong>Dispute · {d.status}</strong>
                    <p>{d.reason}</p>
                    <p className="tf-muted">
                      Booking {d.bookingId}
                      {booking
                        ? ` · ${booking.serviceCategory} · ${providerLabel(booking.providerId)} · ${BOOKING_STATUS_LABELS[booking.status]}`
                        : ""}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ marginTop: "2rem" }}>
          <h2>All bookings</h2>
          <div className="tf-stack">
            {bookings.map((b) => (
              <article key={b.id} className="tf-card tf-txn-row">
                <div>
                  <strong>{b.serviceCategory}</strong>
                  <div className="tf-muted">
                    {providerLabel(b.providerId)} · {b.locationLabel}
                  </div>
                </div>
                <span className="tf-badge">{BOOKING_STATUS_LABELS[b.status]}</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
