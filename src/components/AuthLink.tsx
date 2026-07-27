import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type AuthLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  replace?: boolean;
};

/** Link that sends guests to sign in / sign up first, then continues to `to`. */
export function AuthLink({
  to,
  children,
  className,
  style,
  onClick,
  onMouseEnter,
  onFocus,
  replace,
}: AuthLinkProps) {
  const { isAuthenticated } = useAuth();
  const shared = { className, style, replace, onClick, onMouseEnter, onFocus, children };

  if (isAuthenticated) {
    return <Link to={to} {...shared} />;
  }

  return <Link to="/auth" state={{ from: to }} {...shared} />;
}

/** Navigate helper — guests are sent to /auth with return path. */
export function useAuthNavigate() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (to: string, options?: { replace?: boolean }) => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: to }, replace: options?.replace });
      return;
    }
    navigate(to, options);
  };
}
