import { isApiConfigured } from "./api";
import { isSupabaseConfigured } from "./supabase";

export type BackendMode = "local" | "api" | "supabase";

export function getBackendMode(): BackendMode {
  if (isSupabaseConfigured) return "supabase";
  if (isApiConfigured) return "api";
  return "local";
}

export function backendLabel(mode: BackendMode = getBackendMode()): string {
  if (mode === "supabase") return "Supabase connected";
  if (mode === "api") return "API backend connected";
  return "Local demo (localStorage)";
}
