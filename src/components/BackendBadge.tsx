import { backendLabel, getBackendMode } from "../lib/backend";

export function BackendBadge() {
  const mode = getBackendMode();
  const label =
    mode === "supabase"
      ? "Cloud · Supabase"
      : mode === "api"
        ? "API backend"
        : "Local demo mode";

  return (
    <span className="tf-badge" title={backendLabel(mode)}>
      {label}
    </span>
  );
}
