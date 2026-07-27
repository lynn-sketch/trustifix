const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export const isApiConfigured = Boolean(API_URL);

const TOKEN_KEY = "trustifix.api.token";

export function getApiToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setApiToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  if (!API_URL) throw new Error("API is not configured (set VITE_API_URL).");

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth !== false) {
    const token = getApiToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export type ApiUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: "customer" | "provider" | "admin";
  emailVerified: boolean;
  phoneVerified: boolean;
  avatarUrl?: string;
  walletBalanceCents?: number;
  providerId?: string;
};

export async function apiLogin(login: string, password: string) {
  const data = await apiFetch<{ token: string; user: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: { login, password },
    auth: false,
  });
  setApiToken(data.token);
  return data.user;
}

export async function apiSignUp(input: {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}) {
  const data = await apiFetch<{ token: string; user: ApiUser }>("/api/auth/signup", {
    method: "POST",
    body: input,
    auth: false,
  });
  setApiToken(data.token);
  return data.user;
}

export async function apiMe() {
  return apiFetch<{ user: ApiUser }>("/api/auth/me");
}

export async function apiUpdateMe(
  patch: Partial<Pick<ApiUser, "fullName" | "avatarUrl" | "phone" | "username">>,
) {
  return apiFetch<{ user: ApiUser }>("/api/auth/me", { method: "PATCH", body: patch });
}

export async function apiProviders() {
  return apiFetch<{ providers: unknown[] }>("/api/providers", { auth: false });
}

export async function apiCreateBooking(input: {
  providerId: string;
  locationLabel?: string;
  notes?: string;
  priceHoldCents?: number;
}) {
  return apiFetch<{ booking: unknown }>("/api/bookings", { method: "POST", body: input });
}

export async function apiBookings() {
  return apiFetch<{ bookings: unknown[] }>("/api/bookings");
}

export async function apiUpdateBookingStatus(id: string, status: string) {
  return apiFetch<{ booking: unknown }>(`/api/bookings/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function apiWallet() {
  return apiFetch<{ balanceCents: number; transactions: unknown[] }>("/api/wallet");
}

export async function apiWalletTopup(amountCents: number, label?: string) {
  return apiFetch<{ balanceCents: number; transaction: unknown }>("/api/wallet/topup", {
    method: "POST",
    body: { amountCents, label },
  });
}

export async function apiPanic(input: {
  note?: string;
  lat?: number;
  lng?: number;
  areaLabel?: string;
}) {
  return apiFetch<{ alert: unknown }>("/api/safety/panic", { method: "POST", body: input });
}
