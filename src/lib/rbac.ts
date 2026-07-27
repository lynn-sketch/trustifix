export type UserRole = "guest" | "customer" | "provider" | "admin";

export type Permission =
  | "booking:create"
  | "booking:manage_own"
  | "booking:manage_assigned"
  | "provider:apply"
  | "provider:manage_jobs"
  | "wallet:view"
  | "wallet:payout"
  | "message:send"
  | "admin:access"
  | "admin:moderate"
  | "admin:broadcast"
  | "auction:bid"
  | "review:create";

export const ROLE_PERMISSIONS: Record<Exclude<UserRole, "guest">, Permission[]> = {
  customer: [
    "booking:create",
    "booking:manage_own",
    "provider:apply",
    "wallet:view",
    "message:send",
    "auction:bid",
    "review:create",
  ],
  provider: [
    "booking:manage_assigned",
    "provider:manage_jobs",
    "wallet:view",
    "wallet:payout",
    "message:send",
    "auction:bid",
    "review:create",
  ],
  admin: [
    "booking:create",
    "booking:manage_own",
    "booking:manage_assigned",
    "provider:apply",
    "provider:manage_jobs",
    "wallet:view",
    "wallet:payout",
    "message:send",
    "admin:access",
    "admin:moderate",
    "admin:broadcast",
    "auction:bid",
    "review:create",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (role === "guest") return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
