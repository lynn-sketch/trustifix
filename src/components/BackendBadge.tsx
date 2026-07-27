import { backendLabel, getBackendMode } from "../lib/backend";

export function BackendBadge() {
  const mode = getBackendMode();
  return (
    <span className={`tf-badge ${mode === "supabase" ? "" : ""}`} title={backendLabel(mode)}>
      {mode === "supabase" ? "Cloud · Supabase" : "Local demo mode"}
    </span>
  );
}
