import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { IconCheck, IconIdCard, IconShield, IconSkills } from "../components/Icons";
import { useAuth } from "../contexts/AuthContext";

const PILLARS = [
  {
    title: "Verified providers",
    body: "ID checks, phone verification, and admin review before providers go live on TrustiFix.",
  },
  {
    title: "Secure payments",
    body: "Wallet holds protect customers until the job is completed. Refunds on cancel, payouts on finish.",
  },
  {
    title: "Real-time tracking",
    body: "Booking status, chat, and notifications keep both sides aligned from request to review.",
  },
  {
    title: "Safety alerts",
    body: "Signed-in users can trigger a panic alert that shares location with TrustiFix admin and job partners.",
  },
];

const BADGE_CHECKS = [
  {
    id: "id-verified",
    title: "ID Verified",
    body: "Government ID is reviewed by TrustiFix admin before a provider can accept paid jobs.",
    Icon: IconIdCard,
  },
  {
    id: "skills-tested",
    title: "Skills Tested",
    body: "Category skills are checked against the trade they list — so a plumber isn’t shown as an electrician by mistake.",
    Icon: IconSkills,
  },
  {
    id: "background-checked",
    title: "Background Checked",
    body: "Higher tiers include extra screening. Look for Gold and Platinum badges when you need deeper assurance.",
    Icon: IconShield,
  },
];

export function TrustSafetyPage() {
  const { isAuthenticated } = useAuth();
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <div>
      <Navbar />
      <main className="tf-page tf-trust-page">
        <Link to="/" className="tf-nav-back tf-page-back">
          <span aria-hidden>←</span>
          <span>Back to home</span>
        </Link>
        <p className="tf-badge">Trust & Safety</p>
        <h1>Your Safety is Our Top Priority</h1>
        <p className="tf-muted tf-trust-lead">
          Every interaction on TrustiFix is built to be safe, secure, and transparent — from
          verified providers to held payments and emergency alerts.
        </p>

        <div className="tf-trust-grid">
          {PILLARS.map((p) => (
            <article key={p.title} className="tf-card tf-trust-card">
              <h2>{p.title}</h2>
              <p className="tf-muted">{p.body}</p>
            </article>
          ))}
        </div>

        <section className="tf-card tf-trust-checks" aria-labelledby="badge-checks-title">
          <div className="tf-trust-checks-head">
            <span className="tf-lp-verified-mark" aria-hidden>
              <IconCheck className="tf-inline-icon" />
            </span>
            <h2 id="badge-checks-title">TrustiFix Verified Badge</h2>
            <p className="tf-muted">
              These checks sit behind every green verified badge you see on provider profiles.
            </p>
          </div>
          <div className="tf-trust-check-grid">
            {BADGE_CHECKS.map(({ id, title, body, Icon }) => (
              <article key={id} id={id} className="tf-trust-check-card">
                <span className="tf-trust-check-icon" aria-hidden>
                  <Icon className="tf-inline-icon" />
                </span>
                <h3>{title}</h3>
                <p className="tf-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tf-card tf-trust-cta">
          <h2>Need help right now?</h2>
          <p className="tf-muted">
            {isAuthenticated
              ? "Use the red safety button anytime to alert TrustiFix admin with your location."
              : "Sign in to unlock the panic button, wallet protection, and verified booking chat."}
          </p>
          <div className="tf-chip-row">
            <Link to="/services" className="tf-btn tf-btn-primary">
              Find a provider
            </Link>
            {!isAuthenticated && (
              <Link to="/auth" className="tf-btn tf-btn-secondary">
                Sign in
              </Link>
            )}
            <Link to="/become-provider" className="tf-btn tf-btn-secondary">
              Become a provider
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
