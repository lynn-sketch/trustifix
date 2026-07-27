import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_AREA, KAMPALA_AREAS, nearestArea, type KampalaArea } from "../data/areas";
import { loadJson, saveJson } from "../lib/storage";

export type UserLocation = {
  lat: number;
  lng: number;
  areaId: string;
  label: string;
  source: "default" | "geo" | "manual";
};

type LocationContextValue = {
  location: UserLocation;
  areas: KampalaArea[];
  geoStatus: "idle" | "prompting" | "granted" | "denied" | "unavailable";
  setAreaById: (areaId: string) => void;
  detectLocation: () => void;
  nearbyRadiusKm: number;
};

const STORAGE_KEY = "trustifix.user-location";

const LocationContext = createContext<LocationContextValue | null>(null);

function toUserLocation(area: KampalaArea, source: UserLocation["source"]): UserLocation {
  return {
    lat: area.lat,
    lng: area.lng,
    areaId: area.id,
    label: area.name,
    source,
  };
}

function hydrate(): UserLocation {
  const saved = loadJson<UserLocation | null>(STORAGE_KEY, null);
  if (saved?.areaId && KAMPALA_AREAS.some((a) => a.id === saved.areaId)) {
    return saved;
  }
  return toUserLocation(DEFAULT_AREA, "default");
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(hydrate);
  const [geoStatus, setGeoStatus] = useState<LocationContextValue["geoStatus"]>("idle");

  useEffect(() => {
    saveJson(STORAGE_KEY, location);
  }, [location]);

  const setAreaById = useCallback((areaId: string) => {
    const area = KAMPALA_AREAS.find((a) => a.id === areaId) ?? DEFAULT_AREA;
    setLocation(toUserLocation(area, "manual"));
    setGeoStatus("idle");
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }
    setGeoStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const area = nearestArea(pos.coords.latitude, pos.coords.longitude);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          areaId: area.id,
          label: area.name,
          source: "geo",
        });
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 },
    );
  }, []);

  const value = useMemo(
    () => ({
      location,
      areas: KAMPALA_AREAS,
      geoStatus,
      setAreaById,
      detectLocation,
      /** Kampala is compact — 2.5 km keeps each area’s map distinct */
      nearbyRadiusKm: 2.5,
    }),
    [location, geoStatus, setAreaById, detectLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
