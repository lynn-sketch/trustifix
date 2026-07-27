import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { ProviderMap } from "../components/ProviderMap";
import { UserAvatar } from "../components/UserAvatar";
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

  // Keep filters in sync when Explore / nav lands with new query params
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
    <div>
      <Navbar />
      <main className="tf-page">
        <header className="tf-page-header">
          <h1>Find Your Perfect Service Provider</h1>
          <p className="tf-muted">
            Verified mechanics, technicians, drivers, and home experts near{" "}
            <strong>{location.label}</strong>.
          </p>
          <div className="tf-chip-row" style={{ marginTop: "0.75rem" }}>
            {areas.slice(0, 6).map((a) => (
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
        </header>

        <div className="tf-search-bar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search service, skill, or area…"
            aria-label="Search providers"
          />
          <button
            type="button"
            className={`tf-chip ${nearMe ? "tf-chip-active" : ""}`}
            onClick={() => setNearMe((v) => !v)}
          >
            Near Me
          </button>
          <button
            type="button"
            className={`tf-chip ${view === "list" ? "tf-chip-active" : ""}`}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            type="button"
            className={`tf-chip ${view === "map" ? "tf-chip-active" : ""}`}
            onClick={() => setView("map")}
          >
            Map
          </button>
        </div>

        <div className="tf-chip-row" role="tablist" aria-label="Service categories">
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

        <p className="tf-muted" style={{ margin: "1rem 0" }}>
          {filtered.length} provider{filtered.length === 1 ? "" : "s"}
          {category !== "All Services" ? ` in ${category as ServiceCategory}` : ""}
          {nearMe ? ` within ${nearbyRadiusKm} km of ${location.label}` : " across Kampala"}
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
