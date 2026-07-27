import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { usePlatform } from "../contexts/PlatformContext";
import type { Provider } from "../data/providers";
import { formatUGX } from "../lib/format";
import { distanceKm, formatDistance } from "../lib/geo";
import { IconStar } from "./Icons";

const QUICK_SERVICES = [
  { id: "ac", label: "AC Repair", match: ["ac", "air"], category: "Home Services" },
  { id: "plumbing", label: "Plumbing", match: ["plumb"], category: "Home Services" },
  { id: "car-wash", label: "Car Wash", match: ["wash", "car"], category: "Vehicle Services" },
  { id: "phone", label: "Phone Repair", match: ["phone", "screen"], category: "Tech Support" },
  { id: "locksmith", label: "Locksmith", match: ["lock"], category: "Home Services" },
  { id: "mechanic", label: "Mechanic", match: ["brake", "oil", "mechanic", "auto"], category: "Vehicle Services" },
  { id: "solar", label: "Solar", match: ["solar", "inverter", "battery"], category: "Solar & Energy" },
  { id: "cleaning", label: "Cleaning", match: ["clean", "laundry", "carpet"], category: "Cleaning & Laundry" },
  { id: "childcare", label: "Childcare", match: ["baby", "child", "care"], category: "Childcare" },
  { id: "moving", label: "Moving", match: ["mov", "deliver", "grocery"], category: "Moving & Delivery" },
] as const;

const TIME_SLOTS = [
  { id: "asap", label: "ASAP", hint: "Next available · today" },
  { id: "today-eve", label: "Today evening", hint: "5–8 PM" },
  { id: "tmr-morn", label: "Tomorrow morning", hint: "8–11 AM" },
  { id: "tmr-aft", label: "Tomorrow afternoon", hint: "1–5 PM" },
] as const;

function slotToIso(slotId: string): string {
  const d = new Date();
  if (slotId === "asap") {
    d.setMinutes(d.getMinutes() + 45);
  } else if (slotId === "today-eve") {
    d.setHours(17, 30, 0, 0);
  } else if (slotId === "tmr-morn") {
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
  } else {
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
  }
  return d.toISOString();
}

function scoreProvider(p: Provider, serviceId: string, match: readonly string[]): number {
  const hay = `${p.title} ${p.skills.join(" ")} ${p.category}`.toLowerCase();
  const skillHits = match.filter((m) => hay.includes(m)).length;
  const svc = QUICK_SERVICES.find((s) => s.id === serviceId);
  const catBonus = svc && p.category === svc.category ? 2 : 0;
  return skillHits * 3 + catBonus + p.rating;
}

export function QuickBook() {
  const { location, nearbyRadiusKm } = useLocation();
  const { getEffectiveProviders, createBooking } = usePlatform();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [serviceId, setServiceId] = useState<string>(QUICK_SERVICES[0].id);
  const [slotId, setSlotId] = useState<string>(TIME_SLOTS[0].id);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const service = QUICK_SERVICES.find((s) => s.id === serviceId) ?? QUICK_SERVICES[0];

  const ranked = useMemo(() => {
    return getEffectiveProviders()
      .map((p) => ({
        ...p,
        distanceKm: distanceKm(location, p),
        score: scoreProvider(p, service.id, service.match),
      }))
      .filter((p) => p.distanceKm <= nearbyRadiusKm)
      .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
  }, [getEffectiveProviders, location, nearbyRadiusKm, service]);

  const pick = ranked.find((p) => p.id === providerId) ?? ranked[0] ?? null;

  function goStep2(id: string) {
    setServiceId(id);
    setError("");
    setStep(2);
  }

  function goStep3(id: string) {
    setSlotId(id);
    setProviderId(ranked[0]?.id ?? null);
    setError("");
    setStep(3);
  }

  function confirm() {
    setError("");
    if (!pick) {
      setError("No providers near you for this service. Try another area or service.");
      return;
    }
    if (!isAuthenticated || !user) {
      navigate("/auth", {
        state: {
          from: "/",
          quickBook: { serviceId, slotId, providerId: pick.id },
        },
      });
      return;
    }
    if (user.role === "provider") {
      setError("Switch to a customer account to book.");
      return;
    }

    setBusy(true);
    try {
      const booking = createBooking({
        customerId: user.id,
        providerId: pick.id,
        serviceCategory: `${service.label} · ${pick.title}`,
        locationLabel: `${location.label}, Kampala`,
        notes: `Quick book · ${TIME_SLOTS.find((t) => t.id === slotId)?.label ?? slotId}`,
        scheduledAt: slotToIso(slotId),
        priceHoldCents: pick.startingPriceCents,
      });
      navigate("/dashboard", { state: { justBooked: booking.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create booking");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tf-lp-section tf-quick-book" id="quick-book">
      <p className="tf-badge">Book in 60 seconds</p>
      <h2>
        Need help <span className="tf-accent">right now?</span>
      </h2>
      <p className="tf-lp-lead">
        Pick a service, choose a time, and we’ll match you with a verified pro near{" "}
        <strong>{location.label}</strong>.
      </p>

      <div className="tf-qb-card">
        <ol className="tf-qb-steps" aria-label="Booking steps">
          <li className={step === 1 ? "is-on" : step > 1 ? "is-done" : ""}>1 · Service</li>
          <li className={step === 2 ? "is-on" : step > 2 ? "is-done" : ""}>2 · Time</li>
          <li className={step === 3 ? "is-on" : ""}>3 · Confirm</li>
        </ol>

        {step === 1 && (
          <div className="tf-qb-grid">
            {QUICK_SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`tf-qb-option ${serviceId === s.id ? "is-active" : ""}`}
                onClick={() => goStep2(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <>
            <p className="tf-muted tf-qb-back-row">
              <button type="button" className="tf-link-btn" onClick={() => setStep(1)}>
                ← {service.label}
              </button>
            </p>
            <div className="tf-qb-grid">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tf-qb-option tf-qb-time ${slotId === t.id ? "is-active" : ""}`}
                  onClick={() => goStep3(t.id)}
                >
                  <strong>{t.label}</strong>
                  <span>{t.hint}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="tf-muted tf-qb-back-row">
              <button type="button" className="tf-link-btn" onClick={() => setStep(2)}>
                ← Change time
              </button>
            </p>

            {pick ? (
              <div className="tf-qb-match">
                <div className="tf-qb-match-head">
                  <div className="tf-nearby-avatar" aria-hidden>
                    {pick.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <strong>{pick.name}</strong>
                    <div className="tf-muted">{pick.title}</div>
                    <div className="tf-nearby-meta">
                      <IconStar className="tf-inline-icon tf-star-ico" /> {pick.rating} ·{" "}
                      {formatDistance(pick.distanceKm)} · {pick.area}
                    </div>
                  </div>
                </div>
                <div className="tf-qb-summary">
                  <div>
                    <span className="tf-muted">Service</span>
                    <strong>{service.label}</strong>
                  </div>
                  <div>
                    <span className="tf-muted">When</span>
                    <strong>{TIME_SLOTS.find((t) => t.id === slotId)?.label}</strong>
                  </div>
                  <div>
                    <span className="tf-muted">Hold</span>
                    <strong>{formatUGX(pick.startingPriceCents)}</strong>
                  </div>
                </div>
                {ranked.length > 1 && (
                  <div className="tf-chip-row" style={{ marginBottom: "1rem" }}>
                    {ranked.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`tf-chip ${pick.id === p.id ? "tf-chip-active" : ""}`}
                        onClick={() => setProviderId(p.id)}
                      >
                        {p.name.split(" ")[0]} · {formatDistance(p.distanceKm)}
                      </button>
                    ))}
                  </div>
                )}
                {error && <p className="tf-qb-error">{error}</p>}
                <div className="tf-qb-actions">
                  <button
                    type="button"
                    className="tf-btn tf-btn-primary"
                    disabled={busy}
                    onClick={confirm}
                  >
                    {busy ? "Booking…" : isAuthenticated ? "Confirm booking" : "Sign in & book"}
                  </button>
                  <Link to={`/provider/${pick.id}`} className="tf-btn tf-btn-secondary">
                    View profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="tf-qb-empty">
                <p>No verified providers within {nearbyRadiusKm} km of {location.label}.</p>
                <Link to="/services" className="tf-btn tf-btn-primary">
                  Browse all providers
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
