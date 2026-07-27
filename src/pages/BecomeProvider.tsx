import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";

export function BecomeProviderPage() {
  const { user, isAuthenticated } = useAuth();
  const { submitApplication, applicationForUser } = usePlatform();
  const existing = user ? applicationForUser(user.id) : undefined;

  const [trade, setTrade] = useState("Vehicle Services");
  const [area, setArea] = useState("Kampala");
  const [pitch, setPitch] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    submitApplication({
      userId: user.id,
      fullName: user.fullName,
      category: trade,
      area,
      pitch,
    });
  }

  return (
    <div>
      <Navbar />
      <main className="tf-page" style={{ maxWidth: 560 }}>
        <h1>Become a provider</h1>
        <p className="tf-muted">
          Apply for verification. Admin reviews identity, skills, and service area before approval.
        </p>

        {!isAuthenticated && (
          <div className="tf-card" style={{ padding: "1.25rem", marginTop: "1rem" }}>
            <p style={{ marginTop: 0 }}>
              Create a free customer account first, then submit your provider application.
            </p>
            <Link to="/auth" state={{ from: "/become-provider" }} className="tf-btn tf-btn-primary">
              Log in to apply →
            </Link>
          </div>
        )}

        {isAuthenticated && existing ? (
          <div className="tf-card" style={{ padding: "1.25rem", marginTop: "1rem" }}>
            <span className="tf-badge">{existing.status}</span>
            <h2 style={{ marginBottom: 0 }}>{existing.category}</h2>
            <p className="tf-muted">{existing.area}</p>
            <p>{existing.pitch}</p>
            <p className="tf-muted" style={{ marginTop: "0.75rem" }}>
              Submitted {new Date(existing.createdAt).toLocaleString()}
            </p>
            {existing.status === "approved" && (
              <p>
                You’re verified for onboarding. Keep phone + email verified to stay visible in
                search.
              </p>
            )}
            {existing.status === "rejected" && (
              <p>Update your pitch below and submit again after rejection clears — or contact admin.</p>
            )}
          </div>
        ) : null}

        {isAuthenticated && (!existing || existing.status === "rejected") && (
          <form
            className="tf-form tf-card"
            style={{ padding: "1.25rem", marginTop: "1rem" }}
            onSubmit={onSubmit}
          >
            <label>
              Primary category
              <select value={trade} onChange={(e) => setTrade(e.target.value)}>
                <option>Vehicle Services</option>
                <option>Home Services</option>
                <option>Tech Support</option>
                <option>Drivers</option>
                <option>Solar & Energy</option>
                <option>Childcare</option>
                <option>Cleaning & Laundry</option>
                <option>Moving & Delivery</option>
              </select>
            </label>
            <label>
              Service area
              <input value={area} onChange={(e) => setArea(e.target.value)} required />
            </label>
            <label>
              Why customers should trust you
              <textarea rows={4} value={pitch} onChange={(e) => setPitch(e.target.value)} required />
            </label>
            <button type="submit" className="tf-btn tf-btn-primary">
              Submit for verification
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
