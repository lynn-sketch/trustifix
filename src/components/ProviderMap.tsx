import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Provider } from "../data/providers";
import { formatDistance } from "../lib/geo";
import { IconStar } from "./Icons";
import { UserAvatar } from "./UserAvatar";

type MapProvider = Provider & { distanceKm: number };

type ProviderMapProps = {
  providers: MapProvider[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  userLocation: { lat: number; lng: number; label?: string };
  nearbyRadiusKm?: number;
  nearbyOnly?: boolean;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function youIcon() {
  return L.divIcon({
    className: "tf-leaflet-marker",
    html: `<span class="tf-leaflet-you" title="You"><i></i></span>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
  });
}

function providerIcon(active: boolean, near: boolean) {
  const cls = [
    "tf-leaflet-pro",
    active ? "is-active" : "",
    near ? "is-near" : "is-far",
  ]
    .filter(Boolean)
    .join(" ");
  return L.divIcon({
    className: "tf-leaflet-marker",
    html: `<span class="${cls}" aria-hidden="true">★</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export function ProviderMap({
  providers,
  selectedId,
  onSelect,
  userLocation,
  nearbyRadiusKm = 8,
  nearbyOnly = false,
}: ProviderMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const youMarker = useRef<L.Marker | null>(null);
  const radiusCircle = useRef<L.Circle | null>(null);
  const providerLayer = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const selected =
    providers.find((p) => p.id === selectedId) ?? providers[0] ?? null;
  const nearby = nearbyOnly
    ? providers
    : providers.filter((p) => p.distanceKm <= nearbyRadiusKm);
  const fartherCount = nearbyOnly ? 0 : Math.max(0, providers.length - nearby.length);

  // Create map once
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    const map = L.map(mapEl.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView([userLocation.lat, userLocation.lng], 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    providerLayer.current = L.layerGroup().addTo(map);
    youMarker.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: youIcon(),
      zIndexOffset: 1000,
      interactive: false,
    }).addTo(map);

    radiusCircle.current = L.circle([userLocation.lat, userLocation.lng], {
      radius: nearbyRadiusKm * 1000,
      color: "#e86028",
      weight: 2,
      opacity: 0.75,
      fillColor: "#e86028",
      fillOpacity: 0.12,
    }).addTo(map);

    mapRef.current = map;

    // Leaflet needs a resize after layout
    const t = window.setTimeout(() => map.invalidateSize(), 80);

    return () => {
      window.clearTimeout(t);
      map.remove();
      mapRef.current = null;
      youMarker.current = null;
      radiusCircle.current = null;
      providerLayer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  // Keep You pin + radius in sync with location / radius
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    youMarker.current?.setLatLng([userLocation.lat, userLocation.lng]);
    radiusCircle.current?.setLatLng([userLocation.lat, userLocation.lng]);
    radiusCircle.current?.setRadius(nearbyRadiusKm * 1000);
    map.panTo([userLocation.lat, userLocation.lng], { animate: true });
  }, [userLocation.lat, userLocation.lng, nearbyRadiusKm]);

  // Provider markers
  useEffect(() => {
    const map = mapRef.current;
    const layer = providerLayer.current;
    if (!map || !layer) return;

    layer.clearLayers();

    providers.forEach((p) => {
      const active = selected?.id === p.id;
      const isNear = p.distanceKm <= nearbyRadiusKm;
      const marker = L.marker([p.lat, p.lng], {
        icon: providerIcon(active, isNear || nearbyOnly),
        title: `${p.name} · ${formatDistance(p.distanceKm)}`,
        zIndexOffset: active ? 800 : 200,
      });
      marker.on("click", () => onSelectRef.current(p.id));
      marker.bindTooltip(
        `<strong>${p.name}</strong><br/>${p.area} · ${formatDistance(p.distanceKm)}`,
        { direction: "top", offset: [0, -12], opacity: 0.95 },
      );
      layer.addLayer(marker);
    });

    const points: L.LatLngExpression[] = [
      [userLocation.lat, userLocation.lng],
      ...providers.map((p) => [p.lat, p.lng] as L.LatLngExpression),
    ];
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds.pad(0.25), { animate: true, maxZoom: 14 });
    }

    window.setTimeout(() => map.invalidateSize(), 60);
  }, [
    providers,
    selected?.id,
    nearbyRadiusKm,
    nearbyOnly,
    userLocation.lat,
    userLocation.lng,
  ]);

  return (
    <div className="tf-nearby" aria-label="Providers on map">
      <div className="tf-nearby-map tf-nearby-map-live">
        <div className="tf-nearby-map-legend">
          <span>
            <i className="tf-legend-you" /> You · {userLocation.label ?? "Your location"}
          </span>
          <span>
            <i className="tf-legend-near" /> {nearby.length} nearby pros
          </span>
          {!nearbyOnly && fartherCount > 0 && (
            <span>
              <i className="tf-legend-far" /> {fartherCount} farther
            </span>
          )}
        </div>
        <div ref={mapEl} className="tf-leaflet-root" role="presentation" />
      </div>

      {providers.length > 0 && (
        <div className="tf-nearby-pin-list" role="list">
          {providers.slice(0, 6).map((p, i) => {
            const active = selected?.id === p.id;
            const isNear = p.distanceKm <= nearbyRadiusKm;
            return (
              <button
                key={p.id}
                type="button"
                role="listitem"
                className={`tf-nearby-pin-chip ${active ? "is-active" : ""} ${!isNear ? "is-far" : ""}`}
                style={{ animationDelay: `${100 + i * 70}ms` }}
                onClick={() => onSelect(p.id)}
              >
                <span className="tf-nearby-pin-chip-av" aria-hidden>
                  {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : initials(p.name)}
                </span>
                <span>
                  <strong>{p.name.split(" ")[0]}</strong>
                  <small>
                    {p.area} · {formatDistance(p.distanceKm)}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="tf-nearby-card-wrap" key={selected.id}>
          <article className="tf-nearby-card tf-nearby-card-anim">
            <div className="tf-nearby-avatar" aria-hidden>
              <UserAvatar name={selected.name} src={selected.avatarUrl} size={52} />
            </div>
            <div className="tf-nearby-card-body">
              <div className="tf-nearby-name-row">
                <strong>{selected.name}</strong>
                {selected.verified && <span className="tf-nearby-verified">Verified</span>}
              </div>
              <div className="tf-nearby-meta">
                <span>
                  <IconStar className="tf-inline-icon tf-star-ico" /> {selected.rating}
                </span>
                <span className="tf-nearby-dot">·</span>
                <span>{formatDistance(selected.distanceKm)} away</span>
                <span className="tf-nearby-dot">·</span>
                <span className="tf-nearby-available">
                  {selected.distanceKm <= nearbyRadiusKm ? "Nearby" : selected.area}
                </span>
              </div>
            </div>
            <Link to={`/provider/${selected.id}`} className="tf-btn tf-btn-primary tf-nearby-cta">
              View profile
            </Link>
          </article>

          <div className="tf-nearby-satisfaction">
            <span className="tf-nearby-shield" aria-hidden>
              T
            </span>
            <div>
              <strong>99.2%</strong>
              <div>Satisfaction</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatFab({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="tf-chat-fab" aria-label="Open help chat" onClick={onClick}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 18.5 4.5 20.2V7.8A2.8 2.8 0 0 1 7.3 5h9.4A2.8 2.8 0 0 1 19.5 7.8v6.4a2.8 2.8 0 0 1-2.8 2.8H9.2L7 18.5Z"
          fill="#fff"
        />
        <circle cx="9" cy="11" r="1" fill="#e86028" />
        <circle cx="12" cy="11" r="1" fill="#e86028" />
        <circle cx="15" cy="11" r="1" fill="#e86028" />
      </svg>
    </button>
  );
}
