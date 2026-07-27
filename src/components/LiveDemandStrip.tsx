import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "../contexts/LocationContext";
import { usePlatform } from "../contexts/PlatformContext";
import { DEMAND_SEED } from "../data/demand";

export type DemandItem = {
  id: string;
  ago: string;
  text: string;
  service: string;
  area: string;
  source: "live" | "seed";
};

function relativeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return hrs === 1 ? "1 hr ago" : `${hrs} hrs ago`;
}

export function LiveDemandStrip({ compact = false }: { compact?: boolean }) {
  const { bookings, getEffectiveProviders } = usePlatform();
  const { location } = useLocation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const items = useMemo(() => {
    const providers = getEffectiveProviders();
    const fromBookings: DemandItem[] = [...bookings]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8)
      .map((b) => {
        const prov = providers.find((p) => p.id === b.providerId);
        const service = b.serviceCategory.split("·")[0]?.trim() || b.serviceCategory;
        const area = b.locationLabel.split(",")[0]?.trim() || location.label;
        return {
          id: `bk-${b.id}`,
          ago: relativeAgo(b.createdAt),
          text: `${prov?.name ?? "A customer"} · ${service} booked in ${area}`,
          service,
          area,
          source: "live" as const,
        };
      });

    const seed: DemandItem[] = DEMAND_SEED.map((d) => ({
      id: d.id,
      ago: d.ago,
      text: d.text.replace("{area}", location.label),
      service: d.service,
      area: d.area === "{area}" ? location.label : d.area,
      source: "seed" as const,
    }));

    // Prefer real bookings, then seeds; de-dupe by text
    const merged = [...fromBookings, ...seed];
    const seen = new Set<string>();
    return merged.filter((item) => {
      if (seen.has(item.text)) return false;
      seen.add(item.text);
      return true;
    });
  }, [bookings, getEffectiveProviders, location.label]);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [paused, items.length]);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  const current = items[index % items.length];
  if (!current) return null;

  const liveCount = items.filter((i) => i.source === "live").length;

  return (
    <section
      className={`tf-demand-strip ${compact ? "is-compact" : ""}`}
      aria-label="Live demand near you"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="tf-demand-inner">
        <div className="tf-demand-pulse" aria-hidden>
          <span />
        </div>
        <div className="tf-demand-copy" key={current.id}>
          <div className="tf-demand-meta">
            <strong>Live near {location.label}</strong>
            <span>· {current.ago}</span>
            {liveCount > 0 && <span className="tf-demand-live-tag">{liveCount} from your bookings</span>}
          </div>
          <p>{current.text}</p>
        </div>
        <div className="tf-demand-actions">
          <Link
            to={`/services?q=${encodeURIComponent(current.service)}`}
            className="tf-btn tf-btn-secondary"
          >
            Match this request
          </Link>
          <div className="tf-demand-dots" aria-hidden>
            {items.slice(0, 6).map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={i === index % Math.min(6, items.length) ? "is-on" : ""}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
