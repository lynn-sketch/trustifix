import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { ProviderMap } from "../components/ProviderMap";
import { UserAvatar } from "../components/UserAvatar";
import { IconChart, IconMapPin } from "../components/Icons";
import { CATEGORIES, type ServiceCategory } from "../data/providers";
import { useLocation } from "../contexts/LocationContext";
import { usePlatform } from "../contexts/PlatformContext";
import { distanceKm, formatDistance } from "../lib/geo";
import { formatUGX } from "../lib/format";

function parseCategory(value: string | null): (typeof CATEGORIES)[number] {
  if (value && CATEGORIES.includes(value as (typeof CATEGORIES)[number])) {
    return value as (typeof CATEGORIES)[number];
  }
  return "All Services";
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconNear({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function IconFilters({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  );
}

export function ServicesPage() {
  const { getEffectiveProviders } = usePlatform();
  const { location, nearbyRadiusKm, areas, setAreaById, detectLocation, geoStatus } = useLocation();
  const [params] = useSearchParams();

  const urlQ = params.get("q") ?? "";
  const urlCategory = parseCategory(params.get("category"));
  const hasUrlFilter = Boolean(params.get("q") || params.get("category"));

  const [query, setQuery] = useState(urlQ);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(urlCategory);
  const [nearMe, setNearMe] = useState(!hasUrlFilter);
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setQuery(urlQ);
    setCategory(urlCategory);
    if (hasUrlFilter) setNearMe(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [urlQ, urlCategory, hasUrlFilter]);

  const providers = getEffectiveProviders();

  const filtered = useMemo(() => {
    const withDistance = providers.map((p) => ({
      ...p,
      distanceKm: distanceKm(location, p),
    }));

    let list = withDistance.filter((p) => {
      const matchesCategory = category === "All Services" || p.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q));
      const matchesNear = !nearMe || p.distanceKm <= nearbyRadiusKm;
      return matchesCategory && matchesQuery && matchesNear;
    });

    if (nearMe) list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }, [category, query, nearMe, providers, location, nearbyRadiusKm]);

  return (
    <div className="tf-browse">
      <Navbar />
      <main className="tf-page tf-browse-page">
        <header className="tf-browse-header">
          <h1>Browse verified professionals near you</h1>
        </header>

        <aside className="tf-browse-trend" aria-live="polite">
          <span className="tf-browse-trend-icon" aria-hidden>
            <IconChart className="tf-inline-icon" />
          </span>
          <p>
            <strong>Trending:</strong> It looks like AC repair is really heating up near{" "}
            {location.label} — providers are responding fast.
          </p>
        </aside>

        <div className="tf-browse-toolbar">
          <label className="tf-browse-search">
            <IconSearch className="tf-inline-icon" />
            <span className="tf-sr-only">Search services or pro</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services or pro"
            />
          </label>
          <button
            type="button"
            className={`tf-browse-tool ${nearMe ? "is-on" : ""}`}
            onClick={() => setNearMe((v) => !v)}
          >
            <IconNear className="tf-inline-icon" />
            Near Me
          </button>
          <button
            type="button"
            className={`tf-browse-tool ${view === "map" ? "is-on" : ""}`}
            onClick={() => setView((v) => (v === "map" ? "list" : "map"))}
          >
            <IconMapPin className="tf-inline-icon" />
            Map
          </button>
          <button
            type="button"
            className={`tf-browse-tool ${showFilters ? "is-on" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <IconFilters className="tf-inline-icon" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="tf-browse-filters">
            <p className="tf-muted">Area</p>
            <div className="tf-chip-row tf-chip-scroll">
              {areas.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`tf-chip ${location.areaId === a.id ? "tf-chip-active" : ""}`}
                  onClick={() => setAreaById(a.id)}
                >
                  {a.name}
                </button>
              ))}
              <button
                type="button"
                className="tf-chip"
                onClick={detectLocation}
                disabled={geoStatus === "prompting"}
              >
                {geoStatus === "prompting" ? "Detecting…" : "Use GPS"}
              </button>
            </div>
          </div>
        )}

        <div className="tf-chip-row tf-chip-scroll" role="tablist" aria-label="Service categories">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              className={`tf-chip ${category === c ? "tf-chip-active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <h2 className="tf-browse-count">
          {filtered.length} Provider{filtered.length === 1 ? "" : "s"} Found
        </h2>
        <p className="tf-muted tf-browse-sub">
          {category !== "All Services" ? `${category as ServiceCategory} · ` : ""}
          {nearMe ? `within ${nearbyRadiusKm} km of ${location.label}` : "across Kampala"}
        </p>

        {filtered.length === 0 ? (
          <div className="tf-card" style={{ padding: "1.25rem" }}>
            <strong>No providers match this filter.</strong>
            <p className="tf-muted" style={{ margin: "0.5rem 0 0" }}>
              Try turning off Near Me, picking another category, or clearing the search.
            </p>
          </div>
        ) : view === "map" ? (
          <ProviderMap
            providers={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            userLocation={location}
            nearbyRadiusKm={nearbyRadiusKm}
          />
        ) : (
          <div className="tf-provider-grid">
            {filtered.map((p) => {
              const availableNow = p.responseMins <= 20;
              return (
                <article key={p.id} className="tf-provider-card tf-provider-card-live">
                  <div className="tf-provider-card-top">
                    <div className="tf-provider-card-id">
                      <div className="tf-provider-card-avatar-wrap">
                        <UserAvatar name={p.name} src={p.avatarUrl} size={52} />
                        <span
                          className={`tf-provider-dot ${availableNow ? "is-on" : ""}`}
                          title={availableNow ? "Available now" : "May be busy"}
                        />
                      </div>
                      <div>
                        <h2>
                          <Link to={`/provider/${p.id}`}>{p.name}</Link>
                        </h2>
                        <p className="tf-muted">{p.title}</p>
                        <span className={`tf-provider-status ${availableNow ? "is-on" : ""}`}>
                          {availableNow ? "Available now" : `~${p.responseMins} min`}
                        </span>
                      </div>
                    </div>
                    <div className="tf-rating">
                      <span style={{ color: "var(--tf-star)" }}>★</span> {p.rating}
                    </div>
                  </div>
                  <p style={{ margin: "0.75rem 0" }}>{p.bio}</p>
                  <div className="tf-chip-row">
                    {p.verified && <span className="tf-badge">Verified</span>}
                    <span className="tf-chip">{p.area}</span>
                    <span className="tf-chip">{formatDistance(p.distanceKm)}</span>
                    <span className="tf-chip">{p.category}</span>
                  </div>
                  <div className="tf-provider-card-footer">
                    <div>
                      <strong>From {formatUGX(p.startingPriceCents)}</strong>
                      <div className="tf-muted">{p.reviewCount} reviews</div>
                    </div>
                    <div className="tf-provider-card-ctas">
                      <Link to={`/provider/${p.id}`} className="tf-btn tf-btn-secondary">
                        Profile
                      </Link>
                      <Link to={`/provider/${p.id}#book`} className="tf-btn tf-btn-primary">
                        Book
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
