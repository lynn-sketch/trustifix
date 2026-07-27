import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { UserAvatar } from "../components/UserAvatar";
import { IconCheck, IconStar } from "../components/Icons";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { usePlatform } from "../contexts/PlatformContext";
import { distanceKm, formatDistance } from "../lib/geo";
import { formatUGX } from "../lib/format";

const QUICK_SLOTS = [
  { id: "asap", label: "ASAP", mins: 45 },
  { id: "today", label: "Today evening", hours: 18 },
  { id: "tmr", label: "Tomorrow 9 AM", day: 1, hours: 9 },
];

function slotIso(id: string): string {
  const d = new Date();
  if (id === "asap") {
    d.setMinutes(d.getMinutes() + 45);
  } else if (id === "today") {
    d.setHours(18, 0, 0, 0);
  } else {
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
  }
  return d.toISOString();
}

export function ProviderProfilePage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { location } = useLocation();
  const {
    createBooking,
    openProviderChat,
    getBalanceCents,
    reviews,
    getEffectiveProvider,
    bookingsForProvider,
  } = usePlatform();
  const provider = id ? getEffectiveProvider(id) : undefined;
  const navigate = useNavigate();

  const [locationLabel, setLocationLabel] = useState(
    `${location.label}, Kampala`,
  );
  const [notes, setNotes] = useState("");
  const [slotId, setSlotId] = useState("asap");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#book") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [id]);

  const providerReviews = useMemo(
    () => (provider ? reviews.filter((r) => r.providerId === provider.id) : []),
    [reviews, provider],
  );

  const completedJobs = useMemo(() => {
    if (!provider) return 0;
    return bookingsForProvider(provider.id).filter((b) => b.status === "completed").length;
  }, [bookingsForProvider, provider]);

  if (!provider) {
    return (
      <div>
        <Navbar />
        <main className="tf-page">
          <Link to="/services" className="tf-nav-back tf-page-back">
            ← Back to services
          </Link>
          <h1>Provider not found</h1>
          <Link to="/services" className="tf-btn tf-btn-primary">
            Browse providers
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const dist = distanceKm(location, provider);
  const availableNow = provider.responseMins <= 20;
  const balance = user ? getBalanceCents(user.id) : 0;
  const jobsShown = Math.max(provider.reviewCount, completedJobs + providerReviews.length * 3);

  function requireCustomer(): boolean {
    if (!isAuthenticated || !user) {
      navigate("/auth", { state: { from: `/provider/${provider!.id}` } });
      return false;
    }
    if (user.role === "provider") {
      setError("Switch to a customer account to book or chat.");
      return false;
    }
    return true;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!requireCustomer() || !user) return;

    setSubmitting(true);
    try {
      const booking = createBooking({
        customerId: user.id,
        providerId: provider!.id,
        serviceCategory: `${provider!.category} · ${provider!.title}`,
        locationLabel,
        notes,
        scheduledAt: slotIso(slotId),
        priceHoldCents: provider!.startingPriceCents,
      });
      navigate("/dashboard", { state: { justBooked: booking.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create booking");
    } finally {
      setSubmitting(false);
    }
  }

  function onChat() {
    setError("");
    if (!requireCustomer() || !user) return;
    setChatBusy(true);
    try {
      const threadId = openProviderChat(user.id, provider!.id);
      navigate(`/messages?thread=${threadId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open chat");
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main className="tf-page tf-provider-profile">
        <Link to="/services" className="tf-nav-back tf-page-back">
          ← Back to services
        </Link>

        <header className="tf-pp-hero">
          <div className="tf-pp-identity">
            <div className="tf-pp-avatar-wrap">
              <UserAvatar name={provider.name} src={provider.avatarUrl} size={96} />
              <span className={`tf-pp-live ${availableNow ? "is-on" : ""}`}>
                {availableNow ? "Available now" : "Usually busy"}
              </span>
            </div>
            <div>
              <div className="tf-chip-row" style={{ marginBottom: "0.65rem" }}>
                {provider.verified && (
                  <span className="tf-badge">
                    <IconCheck className="tf-inline-icon" /> Verified
                  </span>
                )}
                {provider.phoneVerified && <span className="tf-badge">Phone verified</span>}
                <span className="tf-chip">{provider.category}</span>
                <span className="tf-chip">{provider.area}</span>
              </div>
              <h1>{provider.name}</h1>
              <p className="tf-pp-title">{provider.title}</p>
              <p className="tf-pp-bio">{provider.bio}</p>
              <div className="tf-pp-rating-row">
                <span className="tf-pp-stars" aria-label={`${provider.rating} stars`}>
                  <IconStar className="tf-inline-icon" /> {provider.rating}
                </span>
                <span>{provider.reviewCount} reviews</span>
                <span>~{provider.responseMins} min response</span>
                <span>{formatDistance(dist)} away</span>
              </div>
            </div>
          </div>

          <aside className="tf-pp-side-card">
            <div className="tf-muted">Starting from</div>
            <strong className="tf-pp-price">{formatUGX(provider.startingPriceCents)}</strong>
            <p className="tf-muted">Held in wallet until the job is done.</p>
            <div className="tf-pp-actions">
              <a href="#book" className="tf-btn tf-btn-primary">
                Book now
              </a>
              <button
                type="button"
                className="tf-btn tf-btn-secondary"
                onClick={onChat}
                disabled={chatBusy}
              >
                {chatBusy ? "Opening…" : "Message"}
              </button>
            </div>
          </aside>
        </header>

        <section className="tf-pp-stats" aria-label="Provider stats">
          <div>
            <strong>{jobsShown}+</strong>
            <span>Jobs done</span>
          </div>
          <div>
            <strong>{provider.responseMins}m</strong>
            <span>Avg response</span>
          </div>
          <div>
            <strong>{provider.rating}</strong>
            <span>Rating</span>
          </div>
          <div>
            <strong>{formatDistance(dist)}</strong>
            <span>From you</span>
          </div>
        </section>

        <section className="tf-pp-section">
          <h2>Skills & services</h2>
          <div className="tf-chip-row">
            {provider.skills.map((skill) => (
              <span key={skill} className="tf-chip tf-chip-active">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <div className="tf-pp-split">
          <section className="tf-card tf-pp-book" id="book">
            <h2>Book {provider.name.split(" ")[0]}</h2>
            <p className="tf-muted">
              Pick a time, describe the job, and we hold payment until you’re happy.
            </p>
            {!isAuthenticated && (
              <p className="tf-muted">
                <Link to="/auth" state={{ from: `/provider/${provider.id}` }}>
                  Sign in
                </Link>{" "}
                as a customer to book or chat.
              </p>
            )}
            {user && user.role === "customer" && (
              <p className="tf-muted">
                Wallet balance: <strong>{formatUGX(balance)}</strong>{" "}
                {balance < provider.startingPriceCents && (
                  <Link to="/wallet">· Top up</Link>
                )}
              </p>
            )}

            <form className="tf-form" onSubmit={onSubmit}>
              <fieldset className="tf-pp-slots">
                <legend>When do you need help?</legend>
                <div className="tf-pp-slot-row">
                  {QUICK_SLOTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`tf-pp-slot ${slotId === s.id ? "is-on" : ""}`}
                      onClick={() => setSlotId(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label>
                Service location
                <input
                  required
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                />
              </label>
              <label>
                What’s wrong / what do you need?
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the issue so they can prepare tools and parts…"
                  required
                />
              </label>
              {error && <p className="tf-error">{error}</p>}
              <button type="submit" className="tf-btn tf-btn-primary" disabled={submitting}>
                {submitting
                  ? "Booking…"
                  : `Confirm · hold ${formatUGX(provider.startingPriceCents)}`}
              </button>
            </form>
          </section>

          <section className="tf-pp-section tf-pp-reviews">
            <h2>Customer reviews</h2>
            {providerReviews.length === 0 ? (
              <p className="tf-muted">No reviews yet — be the first after a completed job.</p>
            ) : (
              <div className="tf-pp-review-list">
                {providerReviews.map((r) => (
                  <article key={r.id} className="tf-card tf-pp-review">
                    <div className="tf-pp-review-top">
                      <span className="tf-pp-stars">
                        {"★".repeat(r.rating)}
                        <span className="tf-muted">{"★".repeat(5 - r.rating)}</span>
                      </span>
                      <time className="tf-muted">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p>{r.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
