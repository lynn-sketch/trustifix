import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navbar } from "../components/Navbar";
import { AuthLink, useAuthNavigate } from "../components/AuthLink";
import { ProviderMap } from "../components/ProviderMap";
import { IconMapPin, IconShield } from "../components/Icons";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { usePlatform } from "../contexts/PlatformContext";
import { distanceKm, formatDistance } from "../lib/geo";

export function IndexPage() {
  const go = useAuthNavigate();
  const { isAuthenticated } = useAuth();
  const { location, areas, geoStatus, setAreaById, detectLocation, nearbyRadiusKm } = useLocation();
  const { getEffectiveProviders } = usePlatform();
  const [mapSelected, setMapSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  const mapProviders = useMemo(() => {
    return getEffectiveProviders()
      .map((p) => ({
        ...p,
        distanceKm: distanceKm(location, p),
      }))
      .filter((p) => p.distanceKm <= nearbyRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [getEffectiveProviders, location, nearbyRadiusKm]);

  const nearbyCount = mapProviders.length;

  useEffect(() => {
    setMapSelected(mapProviders[0]?.id ?? null);
  }, [location.areaId, mapProviders]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    go(q ? `/services?q=${encodeURIComponent(q)}` : "/services");
  }

  return (
    <div className="tf-home tf-home-onepage">
      <Navbar />

      <section className="tf-onepage">
        <div className="tf-onepage-copy">
          <p className="tf-brand-mark">
            <IconShield className="tf-inline-icon" aria-hidden />
            TrustiFix
          </p>
          <h1>
            Pros near you in <span>{location.label}</span>
          </h1>
          <p className="tf-onepage-lead">
            Verified mechanics, technicians, and home experts — tracked and wallet-protected.
          </p>

          <form className="tf-lp-search" onSubmit={onSearch} role="search">
            <label className="tf-sr-only" htmlFor="home-search">
              Search for a service
            </label>
            <input
              id="home-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you need?"
              autoComplete="off"
            />
            <button type="submit" className="tf-btn tf-btn-primary">
              Search
            </button>
          </form>

          <div className="tf-lp-cta-row">
            <AuthLink to="/services" className="tf-btn tf-btn-primary">
              Find a Provider
            </AuthLink>
            <AuthLink to="/become-provider" className="tf-btn tf-btn-secondary">
              Become a Provider
            </AuthLink>
          </div>

          <div className="tf-onepage-meta" role="group" aria-label="Your area">
            <span className="tf-onepage-pin" aria-hidden>
              <IconMapPin className="tf-inline-icon" />
            </span>
            <div>
              <strong>
                {nearbyCount} nearby · within {nearbyRadiusKm} km
              </strong>
              <div className="tf-onepage-meta-actions">
                <button type="button" className="tf-link-btn" onClick={() => setShowAreaPicker((v) => !v)}>
                  Change area
                </button>
                <button
                  type="button"
                  className="tf-link-btn"
                  onClick={detectLocation}
                  disabled={geoStatus === "prompting"}
                >
                  {geoStatus === "prompting" ? "Detecting…" : "Use my location"}
                </button>
              </div>
            </div>
          </div>

          {showAreaPicker && (
            <div className="tf-lp-area-picker tf-onepage-areas">
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

          {!isAuthenticated && (
            <p className="tf-onepage-auth">
              <AuthLink to="/auth">Sign in</AuthLink> to book, message, and pay securely.
            </p>
          )}
        </div>

        <div className="tf-onepage-map">
          <ProviderMap
            providers={mapProviders}
            selectedId={mapSelected}
            onSelect={setMapSelected}
            userLocation={location}
            nearbyRadiusKm={nearbyRadiusKm}
            nearbyOnly
          />
          {nearbyCount > 0 && mapProviders[0] && (
            <p className="tf-onepage-map-hint">
              Closest: {mapProviders[0].name.split(" ")[0]} ·{" "}
              {formatDistance(mapProviders[0].distanceKm)}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
