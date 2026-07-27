import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";
import { UserAvatar } from "./UserAvatar";

function GateNavLink({
  to,
  children,
  onClick,
  end,
}: {
  to: string;
  children: ReactNode;
  onClick?: () => void;
  end?: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const publicPaths = ["/", "/trust-safety", "/auth"];
  const isPublic = publicPaths.some((p) => to === p || (p !== "/" && to.startsWith(p)));

  if (isAuthenticated || isPublic) {
    return (
      <NavLink to={to} end={end} onClick={onClick}>
        {children}
      </NavLink>
    );
  }

  return (
    <NavLink to="/auth" state={{ from: to }} onClick={onClick}>
      {children}
    </NavLink>
  );
}

export function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const { unreadNotificationCount, unreadMessageCount } = usePlatform();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const notifCount = user ? unreadNotificationCount(user.id) : 0;
  const msgCount = user ? unreadMessageCount(user.id) : 0;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sideMenu =
    open &&
    createPortal(
      <>
        <button
          type="button"
          className="tf-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <aside id="tf-side-nav" className="tf-side-nav is-open" role="dialog" aria-modal="true">
          <div className="tf-side-nav-head">
            <div>
              <strong>Menu</strong>
              <p className="tf-muted">
                {isAuthenticated && user ? user.fullName : "Browse TrustiFix"}
              </p>
            </div>
            <button type="button" className="tf-chip" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>

          {isAuthenticated && user && (
            <Link to="/profile" className="tf-side-nav-user" onClick={() => setOpen(false)}>
              <UserAvatar name={user.fullName} src={user.avatarUrl} size={44} />
              <div>
                <strong>{user.fullName}</strong>
                <span>{user.role}</span>
              </div>
            </Link>
          )}

          <nav className="tf-side-nav-list" aria-label="Site">
            <p className="tf-side-nav-label">Explore</p>
            <GateNavLink to="/" end onClick={() => setOpen(false)}>
              Home
            </GateNavLink>
            <GateNavLink to="/services" onClick={() => setOpen(false)}>
              Services
            </GateNavLink>
            <GateNavLink to="/blog" onClick={() => setOpen(false)}>
              Blog
            </GateNavLink>
            <GateNavLink to="/events" onClick={() => setOpen(false)}>
              Events
            </GateNavLink>
            <GateNavLink to="/auction" onClick={() => setOpen(false)}>
              Auction
            </GateNavLink>
            <GateNavLink to="/trust-safety" onClick={() => setOpen(false)}>
              Trust & Safety
            </GateNavLink>
            <GateNavLink to="/become-provider" onClick={() => setOpen(false)}>
              Become a provider
            </GateNavLink>

            {isAuthenticated && user && (
              <>
                <p className="tf-side-nav-label">Account</p>
                {user.role === "customer" && (
                  <NavLink to="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </NavLink>
                )}
                {user.role === "provider" && (
                  <NavLink to="/provider-dashboard" onClick={() => setOpen(false)}>
                    Provider jobs
                  </NavLink>
                )}
                {user.role === "admin" && (
                  <NavLink to="/admin" onClick={() => setOpen(false)}>
                    Admin
                  </NavLink>
                )}
                <NavLink
                  to="/messages"
                  className="tf-nav-badge-link"
                  onClick={() => setOpen(false)}
                >
                  Messages
                  {msgCount > 0 && <span className="tf-count">{msgCount}</span>}
                </NavLink>
                <NavLink
                  to="/notifications"
                  className="tf-nav-badge-link"
                  onClick={() => setOpen(false)}
                >
                  Alerts
                  {notifCount > 0 && <span className="tf-count">{notifCount}</span>}
                </NavLink>
                <NavLink to="/wallet" onClick={() => setOpen(false)}>
                  Wallet
                </NavLink>
                <NavLink to="/profile" onClick={() => setOpen(false)}>
                  Profile
                </NavLink>
              </>
            )}
          </nav>

          <div className="tf-side-nav-foot">
            {isAuthenticated ? (
              <button
                type="button"
                className="tf-btn tf-btn-secondary"
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
              >
                Sign out
              </button>
            ) : (
              <>
                <Link to="/auth" className="tf-btn tf-btn-secondary" onClick={() => setOpen(false)}>
                  Log In
                </Link>
                <Link to="/auth" className="tf-btn tf-btn-primary" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </aside>
      </>,
      document.body,
    );

  const isHome = location.pathname === "/";

  return (
    <>
      <header className="tf-nav tf-nav-shell">
        <div className="tf-nav-shell-start">
          {!isHome && (
            <Link to="/" className="tf-nav-back" aria-label="Back to home">
              <span aria-hidden>←</span>
              <span>Home</span>
            </Link>
          )}
          <Link to="/" className="tf-nav-brand">
            <span className="tf-nav-mark" aria-hidden>
              T
            </span>
            <strong>TrustiFix</strong>
          </Link>
        </div>

        <div className="tf-nav-shell-end">
          {isAuthenticated && user && (
            <Link to="/profile" className="tf-nav-profile" title="Profile">
              <UserAvatar name={user.fullName} src={user.avatarUrl} size={34} />
            </Link>
          )}

          <button
            type="button"
            className={`tf-nav-burger ${open ? "is-open" : ""}`}
            aria-expanded={open}
            aria-controls="tf-side-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      {sideMenu}
    </>
  );
}
