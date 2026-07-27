import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Permission, UserRole } from "../lib/rbac";

type ProtectedRouteProps = {
  children: ReactNode;
  /** If set, user must be signed in */
  requireAuth?: boolean;
  /** Allowed roles (guest never matches unless requireAuth is false) */
  roles?: Array<Exclude<UserRole, "guest">>;
  /** Optional permission check (RBAC) */
  permission?: Permission;
  redirectTo?: string;
};

export function ProtectedRoute({
  children,
  requireAuth = true,
  roles,
  permission,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { isAuthenticated, role, can } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={redirectTo} replace state={{ from }} />;
  }

  if (roles && !roles.includes(role as Exclude<UserRole, "guest">)) {
    return <Navigate to="/" replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
