import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { UserAvatar } from "../components/UserAvatar";
import { AVATAR_PRESETS, useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";

const MAX_BYTES = 600_000;

export function ProfilePage() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const { setProviderAvatar } = usePlatform();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.fullName ?? "");
  const [preview, setPreview] = useState(user?.avatarUrl ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div>
        <Navbar />
        <main className="tf-page" style={{ maxWidth: 520 }}>
          <h1>Profile</h1>
          <p className="tf-muted">Sign in to customize your profile picture and name.</p>
          <Link to="/auth" state={{ from: "/profile" }} className="tf-btn tf-btn-primary">
            Log in
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    setError("");
    setSaved(false);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image is too large. Keep it under about 600 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      setPreview(url);
    };
    reader.readAsDataURL(file);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    updateProfile({ fullName: name, avatarUrl: preview || undefined });
    if (user.role === "provider") {
      setProviderAvatar(user.id, preview || undefined);
    }
    setSaved(true);
  }

  return (
    <div>
      <Navbar />
      <main className="tf-page" style={{ maxWidth: 560 }}>
        <header className="tf-page-header">
          <h1>Your profile</h1>
          <p className="tf-muted">Add a photo so customers and providers recognize you.</p>
        </header>

        <form className="tf-card tf-profile-edit" onSubmit={onSave}>
          <div className="tf-profile-edit-top">
            <UserAvatar name={name || user.fullName} src={preview} size={96} />
            <div>
              <strong>{user.fullName}</strong>
              <div className="tf-muted">@{user.username || "user"}</div>
              <div className="tf-muted">{user.email}</div>
              {user.phone && <div className="tf-muted">{user.phone}</div>}
              <div className="tf-muted" style={{ textTransform: "capitalize" }}>
                {user.role} account
              </div>
              <button
                type="button"
                className="tf-btn tf-btn-secondary"
                style={{ marginTop: "0.75rem" }}
                onClick={() => fileRef.current?.click()}
              >
                Upload photo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onFile}
              />
            </div>
          </div>

          <label>
            Display name
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              required
            />
          </label>

          <div>
            <p className="tf-muted" style={{ marginBottom: "0.5rem" }}>
              Or pick a preset
            </p>
            <div className="tf-avatar-presets">
              {AVATAR_PRESETS.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`tf-avatar-preset ${preview === src ? "is-on" : ""}`}
                  onClick={() => {
                    setPreview(src);
                    setSaved(false);
                  }}
                >
                  <img src={src} alt="" />
                </button>
              ))}
              <button
                type="button"
                className="tf-avatar-preset tf-avatar-clear"
                onClick={() => {
                  setPreview("");
                  setSaved(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {error && <p className="tf-qb-error">{error}</p>}
          {saved && <p className="tf-nearby-available">Profile saved.</p>}

          <div className="tf-chip-row">
            <button type="submit" className="tf-btn tf-btn-primary">
              Save profile
            </button>
            <Link
              to={user.role === "provider" ? "/provider-dashboard" : "/dashboard"}
              className="tf-btn tf-btn-secondary"
            >
              Back
            </Link>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
