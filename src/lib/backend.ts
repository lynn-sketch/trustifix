import { isSupabaseConfigured } from "./supabase";

export type BackendMode = "local" | "supabase";

export function getBackendMode(): BackendMode {
  return isSupabaseConfigured ? "supabase" : "local";
}

export function backendLabel(mode: BackendMode = getBackendMode()): string {
  return mode === "supabase" ? "Supabase connected" : "Local demo (localStorage)";
}
