import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { BackendBadge } from "../components/BackendBadge";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../lib/rbac";
import { getBackendMode } from "../lib/backend";

type Mode = "signin" | "signup";

export function AuthPage() {
  const { signInDemo, signInWithPassword, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const cloud = getBackendMode() === "supabase";
  const needsAuthPrompt = Boolean((location.state as { from?: string } | null)?.from);

  const [mode, setMode] = useState<Mode>("signin");
  const [login, setLogin] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function goAfterAuth(role: Exclude<UserRole, "guest">) {
    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "provider") navigate("/provider-dashboard", { replace: true });
    else navigate(from.startsWith("/auth") ? "/dashboard" : from, { replace: true });
  }

  function enterDemo(role: Exclude<UserRole, "guest">) {
    signInDemo(role);
    goAfterAuth(role);
  }

  function onSignIn(e: FormEvent) {
    e.preventDefault();
    const result = signInWithPassword(login, password);
    if (result.error || !result.role) {
      setError(result.error ?? "Could not sign in.");
      return;
    }
    setError(null);
    goAfterAuth(result.role);
  }

  function onSignUp(e: FormEvent) {
    e.preventDefault();
    const err = signUp({ fullName, username, email, phone, password });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    navigate(from.startsWith("/auth") ? "/dashboard" : from, { replace: true });
  }

  return (
    <div>
      <Navbar />
      <main className="tf-page" style={{ maxWidth: 480 }}>
        <div className="tf-chip-row" style={{ marginBottom: "0.75rem" }}>
          <BackendBadge />
        </div>
        <h1>{mode === "signin" ? "Sign in to TrustiFix" : "Create your account"}</h1>
        {needsAuthPrompt ? (
          <p className="tf-auth-prompt">Sign in or create an account to continue.</p>
        ) : (
          <p className="tf-muted">
            {cloud
              ? "Supabase env detected. Local accounts still work for UI testing."
              : "Use your email, username, phone, and password. Accounts are saved in this browser."}
          </p>
        )}

        <div className="tf-auth-tabs" role="tablist" aria-label="Auth mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={mode === "signin" ? "is-on" : ""}
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "is-on" : ""}
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
          >
            Create account
          </button>
        </div>

        {mode === "signin" ? (
          <form className="tf-auth-form" onSubmit={onSignIn} autoComplete="off">
            <label>
              Email, username, or phone
              <input
                name="tf-login"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                  setError(null);
                }}
                placeholder="Enter email, username, or phone"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="tf-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter password"
              />
            </label>
            {error && <p className="tf-auth-error">{error}</p>}
            <button type="submit" className="tf-btn tf-btn-primary">
              Sign in
            </button>
          </form>
        ) : (
          <form className="tf-auth-form" onSubmit={onSignUp} autoComplete="off">
            <label>
              Full name
              <input
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError(null);
                }}
                placeholder="Your full name"
              />
            </label>
            <label>
              Username
              <input
                name="tf-username"
                autoComplete="off"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Choose a username"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="tf-email"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="Your email"
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                name="tf-phone"
                autoComplete="off"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                placeholder="Your phone number"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="tf-new-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Create a password"
              />
            </label>
            {error && <p className="tf-auth-error">{error}</p>}
            <button type="submit" className="tf-btn tf-btn-primary">
              Create account
            </button>
          </form>
        )}

        <p className="tf-muted" style={{ marginTop: "1.75rem", marginBottom: "0.65rem" }}>
          Quick demo roles
        </p>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <button type="button" className="tf-btn tf-btn-secondary" onClick={() => enterDemo("customer")}>
            Customer · book providers
          </button>
          <button type="button" className="tf-btn tf-btn-secondary" onClick={() => enterDemo("provider")}>
            Provider · Alex Okello (AC specialist)
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
