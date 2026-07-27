import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { AuthLink, useAuthNavigate } from "../components/AuthLink";
import { ProviderMap } from "../components/ProviderMap";
import { LiveDemandStrip } from "../components/LiveDemandStrip";
import { QuickBook } from "../components/QuickBook";
import { SiteFooter } from "../components/SiteFooter";
import {
  BenefitIcon,
  IconBolt,
  IconChart,
  IconCheck,
  IconIdCard,
  IconMapPin,
  IconShield,
  IconSkills,
} from "../components/Icons";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { usePlatform } from "../contexts/PlatformContext";
import {
  COMPARE_ROWS,
  EMERGENCY_SERVICES,
  HIGHLIGHTS,
  HOME_FAQS,
  HOW_STEPS,
  LOCAL_PERKS,
  PAIN_POINTS,
  PLATFORM_CATEGORIES,
  PROVIDER_BENEFITS,
  TESTIMONIALS,
  TIERS,
  TRUST_FEATURES,
  TRUST_STATS,
} from "../data/landing";
import { distanceKm, formatDistance } from "../lib/geo";

const QUICK_SUGGESTS = [
  "Car wash",
  "AC repair",
  "Plumbing",
  "Phone repair",
  "Locksmith",
  "Solar",
  "Childcare",
  "Laundry",
  "Moving",
];

export function IndexPage() {
  const go = useAuthNavigate();
  const { isAuthenticated } = useAuth();
  const { location, areas, geoStatus, setAreaById, detectLocation, nearbyRadiusKm } = useLocation();
  const { getEffectiveProviders } = usePlatform();
  const [mapSelected, setMapSelected] = useState<string | null>(null);
  const [tier, setTier] = useState("gold");
  const [activeEmergency, setActiveEmergency] = useState("Car Wash");
  const [query, setQuery] = useState("");
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const allMapProviders = useMemo(() => {
    return getEffectiveProviders()
      .map((p) => ({
        ...p,
        distanceKm: distanceKm(location, p),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [getEffectiveProviders, location]);

  /** Only providers within the nearby radius for the selected location */
  const mapProviders = useMemo(
    () => allMapProviders.filter((p) => p.distanceKm <= nearbyRadiusKm),
    [allMapProviders, nearbyRadiusKm],
  );

  const nearbyCount = mapProviders.length;

  // When area changes, select the closest nearby provider (if any)
  useEffect(() => {
    setMapSelected(mapProviders[0]?.id ?? null);
  }, [location.areaId, mapProviders]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    go(q ? `/services?q=${encodeURIComponent(q)}` : "/services");
  }

  function onGuestAction(to: string) {
    go(to);
  }

  return (
    <div className="tf-home">
      <Navbar />

      <section className="tf-lp-hero">
        <div className="tf-lp-hero-grid">
          <div className="tf-lp-hero-copy">
            <p className="tf-lp-hero-kicker">
              <span className="tf-lp-hero-kicker-dot" aria-hidden />
              Kampala’s trusted on-demand service platform
            </p>
            <h1>
              Need help fast? <span>Pros are on the way.</span>
            </h1>
            <p>
              Connect with verified mechanics, technicians, drivers, and home experts around{" "}
              {location.label}. Tracked, transparent, and wallet-protected.
            </p>

            <form className="tf-lp-search" onSubmit={onSearch} role="search">
              <label className="tf-sr-only" htmlFor="home-search">
                Search for a service
              </label>
              <input
                id="home-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you need? e.g. car wash, plumbing…"
                autoComplete="off"
              />
              <button type="submit" className="tf-btn tf-btn-primary">
                Search
              </button>
            </form>

            <div className="tf-chip-row tf-lp-suggests">
              {QUICK_SUGGESTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="tf-chip"
                  onClick={() => onGuestAction(`/services?q=${encodeURIComponent(s)}`)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="tf-lp-cta-row">
              {isAuthenticated ? (
                <a href="#quick-book" className="tf-btn tf-btn-primary">
                  Book in 60 seconds
                </a>
              ) : (
                <AuthLink to="/#quick-book" className="tf-btn tf-btn-primary">
                  Book in 60 seconds
                </AuthLink>
              )}
              <AuthLink to="/services" className="tf-btn tf-btn-secondary">
                Find a Provider
              </AuthLink>
              <AuthLink to="/become-provider" className="tf-btn tf-btn-secondary">
                Become a Provider
              </AuthLink>
            </div>
          </div>

          <div className="tf-lp-hero-visual">
            <ProviderMap
              providers={mapProviders}
              selectedId={mapSelected}
              onSelect={setMapSelected}
              userLocation={location}
              nearbyRadiusKm={nearbyRadiusKm}
              nearbyOnly
            />
            {nearbyCount === 0 ? (
              <p className="tf-lp-map-empty">
                No providers within {nearbyRadiusKm} km of {location.label}.{" "}
                <button type="button" className="tf-link-btn" onClick={() => setShowAreaPicker(true)}>
                  Try another area
                </button>
              </p>
            ) : (
              <p className="tf-lp-map-hint">
                {nearbyCount} nearby in <strong>{location.label}</strong> (within {nearbyRadiusKm}{" "}
                km):{" "}
                {mapProviders
                  .map((p) => `${p.name.split(" ")[0]} (${formatDistance(p.distanceKm)})`)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="tf-lp-hero-below" data-reveal>
          <div className="tf-lp-highlights">
            <p className="tf-badge">Featured pros</p>
            <h2>Provider Highlights</h2>
            <div className="tf-lp-avatars">
              {HIGHLIGHTS.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  className={`tf-lp-avatar tf-tone-${h.tone}`}
                  onClick={() =>
                    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <img src={h.image} alt={h.name} className="tf-lp-avatar-img" />
                  <small>{h.name}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="tf-lp-location" role="group" aria-label="Your area">
            <div className="tf-lp-location-main">
              <span className="tf-lp-location-pin" aria-hidden>
                <IconMapPin className="tf-inline-icon" />
              </span>
              <div>
                <strong>
                  {nearbyCount} provider{nearbyCount === 1 ? "" : "s"} near {location.label}
                </strong>
                <div className="tf-muted">
                  Within {nearbyRadiusKm} km
                  {location.source === "geo"
                    ? " · GPS"
                    : location.source === "manual"
                      ? " · your area"
                      : " · default"}
                  {mapProviders[0] &&
                    ` · closest ${mapProviders[0].name.split(" ")[0]} · ${formatDistance(mapProviders[0].distanceKm)}`}
                </div>
              </div>
            </div>
            <div className="tf-lp-location-actions">
              <button
                type="button"
                className="tf-chip"
                onClick={() => setShowAreaPicker((v) => !v)}
              >
                Change area
              </button>
              <button
                type="button"
                className="tf-chip tf-chip-active"
                onClick={detectLocation}
                disabled={geoStatus === "prompting"}
              >
                {geoStatus === "prompting" ? "Detecting…" : "Use my location"}
              </button>
            </div>
            {showAreaPicker && (
              <div className="tf-lp-area-picker">
                {areas.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`tf-chip ${location.areaId === a.id ? "tf-chip-active" : ""}`}
                    onClick={() => {
                      setAreaById(a.id);
                      setShowAreaPicker(false);
                    }}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            )}
            {geoStatus === "denied" && (
              <p className="tf-lp-geo-hint">Location blocked — pick an area above instead.</p>
            )}
            {geoStatus === "unavailable" && (
              <p className="tf-lp-geo-hint">GPS not available in this browser — pick an area.</p>
            )}
          </div>

          <LiveDemandStrip compact />
        </div>
      </section>

      <div data-reveal>
        <QuickBook />
      </div>

      <section className="tf-lp-section tf-lp-promise" data-reveal>
        <p className="tf-badge">Built for Kampala</p>
        <h2>
          Pros come to you. <span className="tf-accent">Vetted, tracked, transparent.</span>
        </h2>
        <p className="tf-lp-lead">
          Inspired by the best of on-demand repair platforms — adapted for TrustiFix’s full
          marketplace: vehicle, home, tech, and more, with wallet holds instead of guesswork.
        </p>
        <div className="tf-lp-perk-row">
          {LOCAL_PERKS.map((perk, i) => (
            <article key={perk.title} className="tf-lp-perk" style={{ ["--d" as string]: `${i * 0.08}s` }}>
              <strong>{perk.title}</strong>
              <p>{perk.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tf-lp-section" id="categories" data-reveal>
        <p className="tf-badge">Our Services</p>
        <h2>
          Everything You Need, <span className="tf-accent">One Platform</span>
        </h2>
        <p className="tf-lp-lead">
          From car repairs to childcare, find verified professionals for every service. All backed
          by our trust guarantee.
        </p>
        <div className="tf-lp-cat-grid">
          {PLATFORM_CATEGORIES.map((cat) => (
            <AuthLink key={cat.title} to={cat.to} className={`tf-lp-cat tf-tone-${cat.tone}`}>
              <div className="tf-lp-cat-media">
                <img src={cat.image} alt="" loading="lazy" />
              </div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
              <div className="tf-chip-row">
                {cat.tags.map((t) => (
                  <span key={t} className="tf-chip">
                    {t}
                  </span>
                ))}
              </div>
              <span className="tf-lp-explore">Explore →</span>
            </AuthLink>
          ))}
        </div>
      </section>

      <section className="tf-lp-section tf-lp-pains" data-reveal>
        <p className="tf-badge">The problem</p>
        <h2>
          Service trouble is stressful enough.{" "}
          <span className="tf-accent">Finding help should not be.</span>
        </h2>
        <div className="tf-lp-pain-grid">
          {PAIN_POINTS.map((item, i) => (
            <article key={item.title} className="tf-lp-pain" style={{ ["--d" as string]: `${i * 0.07}s` }}>
              <span className="tf-lp-pain-n" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tf-lp-section tf-lp-emergency" data-reveal>
        <p className="tf-badge tf-badge-urgent">
          <IconBolt className="tf-inline-icon" /> Quick & Emergency Services
        </p>
        <h2>Need Help Fast?</h2>
        <p className="tf-lp-lead">
          Get quick assistance for urgent needs with our emergency-ready providers.
        </p>
        <div className="tf-lp-emergency-grid">
          {EMERGENCY_SERVICES.map((s) => (
            <AuthLink
              key={s.title}
              to={`/services?q=${encodeURIComponent(s.title)}`}
              className={`tf-lp-emergency-card ${activeEmergency === s.title ? "is-active" : ""}`}
              onMouseEnter={() => setActiveEmergency(s.title)}
              onFocus={() => setActiveEmergency(s.title)}
            >
              {s.urgent && <span className="tf-lp-247">24/7</span>}
              <div className="tf-lp-emergency-media">
                <img src={s.image} alt="" loading="lazy" />
              </div>
              <strong>{s.title}</strong>
              <div className="tf-chip-row">
                {s.tags.map((t) => (
                  <span key={t} className="tf-chip">
                    {t}
                  </span>
                ))}
              </div>
            </AuthLink>
          ))}
        </div>
      </section>

      <section className="tf-lp-section" data-reveal>
        <h2>Choose Your Service Tier</h2>
        <p className="tf-lp-lead">Select the level of service that fits your needs</p>
        <div className="tf-lp-tiers">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tf-lp-tier ${t.premium ? "is-platinum" : ""} ${t.popular ? "is-gold" : ""} ${tier === t.id ? "is-selected" : ""}`}
              onClick={() => setTier(t.id)}
            >
              {t.popular && <span className="tf-lp-popular">POPULAR</span>}
              <span className="tf-lp-tier-shield" aria-hidden>
                ✓
              </span>
              <h3>{t.name}</h3>
              <p>{t.tagline}</p>
              <ul>
                {t.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
        <AuthLink
          to={`/services?tier=${tier}`}
          className="tf-btn tf-btn-primary"
          style={{ marginTop: "1.25rem" }}
        >
          Continue with {TIERS.find((t) => t.id === tier)?.name}
        </AuthLink>
      </section>

      <section className="tf-lp-section tf-lp-how" data-reveal>
        <p className="tf-badge">How It Works</p>
        <h2 className="tf-accent">Get Help in 4 Simple Steps</h2>
        <p className="tf-lp-lead">
          Tell us what you need, pick a verified pro, lock funds in your wallet, then track arrival —
          same simple flow people expect from modern on-demand platforms.
        </p>
        <div className="tf-lp-how-grid">
          {HOW_STEPS.map((step, i) => (
            <article
              key={step.n}
              className="tf-lp-how-card"
              style={{ ["--d" as string]: `${i * 0.08}s` }}
            >
              <span className="tf-lp-step-num">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
        <p className="tf-lp-ready">Ready to experience trusted service?</p>
        <AuthLink to="/services" className="tf-lp-start">
          Start your first booking
        </AuthLink>
      </section>

      <section className="tf-lp-section tf-lp-compare" data-reveal>
        <p className="tf-badge">Why TrustiFix</p>
        <h2>
          Simple, fair, and <span className="tf-accent">built around you</span>
        </h2>
        <p className="tf-lp-lead">
          No subscription to browse. Pros ranked by merit and reviews — not ads. Secure release only
          when the job is done.
        </p>
        <div className="tf-lp-compare-board">
          <div className="tf-lp-compare-col is-muted">
            <h3>Others</h3>
            <ul>
              {COMPARE_ROWS.map((row) => (
                <li key={row.others}>{row.others}</li>
              ))}
            </ul>
          </div>
          <div className="tf-lp-compare-col is-us">
            <h3>TrustiFix</h3>
            <ul>
              {COMPARE_ROWS.map((row) => (
                <li key={row.us}>
                  <IconCheck className="tf-inline-icon" /> {row.us}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="tf-lp-section tf-lp-quotes" data-reveal>
        <p className="tf-badge">Early testers say</p>
        <h2>Confidence from real Kampala bookings</h2>
        <div className="tf-lp-quote-grid">
          {TESTIMONIALS.map((t, i) => (
            <blockquote key={t.place} style={{ ["--d" as string]: `${i * 0.09}s` }}>
              <p>“{t.quote}”</p>
              <footer>
                {t.name} · {t.place}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="tf-lp-section tf-lp-trust" id="trust" data-reveal>
        <div className="tf-lp-trust-intro">
          <p className="tf-badge">Trust & Safety</p>
          <h2>
            Your Safety is Our <span className="tf-accent">Top Priority</span>
          </h2>
          <p className="tf-lp-lead">
            We’ve built multiple layers of protection to ensure every interaction on TrustiFix is
            safe, secure, and transparent.
          </p>
        </div>
        <div className="tf-lp-stats">
          {TRUST_STATS.map((s) => (
            <div key={s.label} className="tf-lp-stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="tf-lp-trust-grid">
          {TRUST_FEATURES.map((f) => (
            <article key={f.title} className="tf-lp-trust-card">
              <span className="tf-lp-trust-icon" aria-hidden>
                ✓
              </span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="tf-lp-verified-banner">
          <span className="tf-lp-verified-mark" aria-hidden>
            <IconCheck className="tf-inline-icon" />
          </span>
          <h3>TrustiFix Verified Badge</h3>
          <p>
            Look for the green verified badge on provider profiles. It means they’ve passed our
            rigorous verification process and maintain high service standards.
          </p>
          <div className="tf-chip-row tf-lp-verified-tags">
            <Link to="/trust-safety#id-verified" className="tf-lp-verified-tag">
              <IconIdCard className="tf-inline-icon" />
              ID Verified
            </Link>
            <Link to="/trust-safety#skills-tested" className="tf-lp-verified-tag">
              <IconSkills className="tf-inline-icon" />
              Skills Tested
            </Link>
            <Link to="/trust-safety#background-checked" className="tf-lp-verified-tag">
              <IconShield className="tf-inline-icon" />
              Background Checked
            </Link>
          </div>
        </div>
      </section>

      <section className="tf-lp-section tf-lp-faq" data-reveal id="faq">
        <p className="tf-badge">FAQ</p>
        <h2>Your questions, answered</h2>
        <p className="tf-lp-lead">
          Straight answers on choosing pros, wallet holds, and how TrustiFix keeps jobs transparent.
        </p>
        <div className="tf-lp-faq-list">
          {HOME_FAQS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className={`tf-lp-faq-item ${open ? "is-open" : ""}`}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? -1 : i)}
                >
                  <span>{item.q}</span>
                  <span className="tf-lp-faq-toggle" aria-hidden>
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && <p>{item.a}</p>}
              </div>
            );
          })}
        </div>
        <div className="tf-lp-faq-cta">
          <AuthLink to="/services" className="tf-btn tf-btn-primary">
            Find a provider
          </AuthLink>
          <Link to="/trust-safety" className="tf-btn tf-btn-secondary">
            Trust & Safety
          </Link>
        </div>
      </section>

      <section className="tf-lp-section tf-lp-provider" id="providers" data-reveal>
        <div className="tf-lp-provider-grid">
          <div>
            <p className="tf-badge tf-badge-orange">For Service Providers</p>
            <h2>
              Turn Your Skills Into <span className="tf-orange">Steady Income</span>
            </h2>
            <p className="tf-lp-lead">
              Join our network of verified professionals and connect with customers who value
              quality and trust. Set your own rates, build your reputation, and grow your business
              on your terms.
            </p>
            <div className="tf-lp-benefit-grid">
              {PROVIDER_BENEFITS.map((b) => (
                <div key={b.title} className="tf-lp-benefit">
                  <span className={`tf-lp-benefit-icon tf-icon-${b.icon}`} aria-hidden>
                    <BenefitIcon name={b.icon} className="tf-inline-icon" />
                  </span>
                  <div>
                    <strong>{b.title}</strong>
                    <span>{b.body}</span>
                  </div>
                </div>
              ))}
            </div>
            <AuthLink to="/become-provider" className="tf-btn tf-btn-orange">
              Apply as Provider
            </AuthLink>
          </div>

          <aside className="tf-lp-dash-card">
            <span className="tf-lp-top-earner">
              <IconChart className="tf-inline-icon" /> Top Earner
            </span>
            <div className="tf-lp-dash-top">
              <div className="tf-lp-dash-avatar">SK</div>
              <div>
                <strong>Sarah K.</strong>
                <div className="tf-muted">Platinum Provider</div>
              </div>
              <span className="tf-lp-online">
                <i /> Online
              </span>
            </div>
            <div className="tf-lp-dash-earn">
              <span className="tf-muted">This Month’s Earnings</span>
              <div className="tf-lp-dash-amount">
                <strong>$4,280</strong>
                <span className="tf-nearby-available">+23% ↑</span>
              </div>
            </div>
            <div className="tf-lp-dash-stats">
              <div>
                <strong>48</strong>
                <span>Jobs Done</span>
              </div>
              <div>
                <strong>4.9</strong>
                <span>Rating</span>
              </div>
              <div>
                <strong>98%</strong>
                <span>Completion</span>
              </div>
            </div>
            <ul className="tf-lp-dash-jobs">
              <li>
                <span className="tf-lp-job-avatar tf-tone-teal" aria-hidden>
                  AC
                </span>
                <div>
                  <strong>AC Repair</strong>
                  <div className="tf-muted">2 hours ago</div>
                </div>
                <strong className="tf-lp-job-pay">+$85</strong>
              </li>
              <li>
                <span className="tf-lp-job-avatar tf-tone-orange" aria-hidden>
                  EF
                </span>
                <div>
                  <strong>Electrical Fix</strong>
                  <div className="tf-muted">Yesterday</div>
                </div>
                <strong className="tf-lp-job-pay">+$120</strong>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
