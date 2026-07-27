import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";
import { EVENTS } from "../data/events";

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} – ${e.toLocaleTimeString([], { timeStyle: "short" })}`;
}

export function EventsPage() {
  const { user, isAuthenticated } = useAuth();
  const { registerForEvent, unregisterFromEvent, isRegisteredForEvent, registrationCount } =
    usePlatform();

  return (
    <div>
      <Navbar />
      <main className="tf-page">
        <header className="tf-page-header">
          <p className="tf-badge">Community</p>
          <h1>Events</h1>
          <p className="tf-muted">
            Workshops, meetups, and provider trainings across Kampala.
          </p>
        </header>

        <div className="tf-blog-grid">
          {EVENTS.map((event) => {
            const count = registrationCount(event.id);
            const registered = user ? isRegisteredForEvent(event.id, user.id) : false;
            const full = count >= event.capacity;

            return (
              <article key={event.id} className="tf-card tf-blog-card">
                <div className="tf-chip-row">
                  <span className="tf-badge">{event.category}</span>
                  <span className="tf-chip">
                    {count}/{event.capacity} seats
                  </span>
                </div>
                <h2>{event.title}</h2>
                <p className="tf-muted">{event.summary}</p>
                <div className="tf-blog-meta">
                  {formatRange(event.startsAt, event.endsAt)}
                  <br />
                  {event.place} · Host {event.host}
                </div>

                {!isAuthenticated ? (
                  <Link to="/auth" state={{ from: "/events" }} className="tf-btn tf-btn-primary">
                    Sign in to RSVP
                  </Link>
                ) : registered ? (
                  <button
                    type="button"
                    className="tf-btn tf-btn-secondary"
                    onClick={() => unregisterFromEvent(event.id, user!.id)}
                  >
                    Cancel RSVP
                  </button>
                ) : (
                  <button
                    type="button"
                    className="tf-btn tf-btn-primary"
                    disabled={full}
                    onClick={() => registerForEvent(event.id, user!.id)}
                  >
                    {full ? "Event full" : "RSVP"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
