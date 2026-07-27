import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";
import type { NotificationKind } from "../contexts/PlatformContext";

const FILTERS: Array<"all" | NotificationKind> = [
  "all",
  "booking",
  "message",
  "wallet",
  "safety",
  "system",
];

export function NotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePlatform();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const navigate = useNavigate();

  const mine = useMemo(() => {
    if (!user) return [];
    return notifications
      .filter((n) => n.userId === user.id)
      .filter((n) => filter === "all" || n.kind === filter);
  }, [notifications, user, filter]);

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="tf-page">
        <header className="tf-page-header" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1>Notifications</h1>
            <p className="tf-muted">Bookings, messages, wallet, and safety alerts.</p>
          </div>
          <button
            type="button"
            className="tf-btn tf-btn-secondary"
            onClick={() => markAllNotificationsRead(user.id)}
          >
            Mark all read
          </button>
        </header>

        <div className="tf-chip-row" style={{ marginBottom: "1rem" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`tf-chip ${filter === f ? "tf-chip-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {mine.length === 0 ? (
          <div className="tf-card" style={{ padding: "1.25rem" }}>
            <p className="tf-muted">No notifications in this filter.</p>
            <Link to="/services">Book a provider to generate activity →</Link>
          </div>
        ) : (
          <div className="tf-stack">
            {mine.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`tf-card tf-notif-row ${n.read ? "" : "tf-notif-unread"}`}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.href) navigate(n.href);
                }}
              >
                <div>
                  <div className="tf-chip-row" style={{ marginBottom: "0.35rem" }}>
                    <span className="tf-badge">{n.kind}</span>
                    {!n.read && <span className="tf-chip tf-chip-active">New</span>}
                  </div>
                  <strong>{n.title}</strong>
                  <p style={{ margin: "0.25rem 0 0" }}>{n.body}</p>
                  <div className="tf-muted" style={{ fontSize: "0.85rem" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
