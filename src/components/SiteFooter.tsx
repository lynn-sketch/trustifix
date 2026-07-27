import { Link, useNavigate } from "react-router-dom";
import { FOOTER } from "../data/landing";
import { useAuth } from "../contexts/AuthContext";
import { IconMail, IconMapPin, IconPhone } from "./Icons";

type FooterLink = {
  label: string;
  to?: string;
  category?: string;
  hash?: string;
  href?: string;
};

function footerHref(link: FooterLink): string {
  if (link.href) return link.href;
  const pathname = link.to ?? "/";
  if (link.category) return `${pathname}?category=${encodeURIComponent(link.category)}`;
  if (link.hash) return `${pathname}#${link.hash}`;
  return pathname;
}

function isPublicPath(path: string) {
  return path === "/" || path.startsWith("/trust-safety") || path.startsWith("/auth");
}

function FooterNavLink({ link }: { link: FooterLink }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (link.href) {
    return (
      <a href={link.href} className="tf-footer-link">
        {link.label}
      </a>
    );
  }

  const href = footerHref(link);
  const needsAuth = !isAuthenticated && !isPublicPath(href);

  return (
    <Link
      to={needsAuth ? "/auth" : href}
      state={needsAuth ? { from: href } : undefined}
      className="tf-footer-link"
      onClick={(e) => {
        if (needsAuth || !link.hash) return;
        e.preventDefault();
        navigate({ pathname: link.to ?? "/", hash: link.hash });
        window.setTimeout(() => {
          document.getElementById(link.hash!)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }}
    >
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="tf-footer">
      <div className="tf-footer-inner">
        <div className="tf-footer-brand">
          <Link to="/" className="tf-nav-brand tf-footer-logo">
            <span className="tf-nav-mark" aria-hidden>
              T
            </span>
            <strong>TrustiFix</strong>
          </Link>
          <p>{FOOTER.tagline}</p>
          <ul className="tf-footer-contact">
            <li>
              <a href={`mailto:${FOOTER.email}`} className="tf-footer-contact-link">
                <IconMail className="tf-footer-ico" />
                <span>{FOOTER.email}</span>
              </a>
            </li>
            <li>
              <a href={`tel:${FOOTER.phone.replace(/\s/g, "")}`} className="tf-footer-contact-link">
                <IconPhone className="tf-footer-ico" />
                <span>{FOOTER.phone}</span>
              </a>
            </li>
            <li>
              <span className="tf-footer-contact-link">
                <IconMapPin className="tf-footer-ico" />
                <span>{FOOTER.location}</span>
              </span>
            </li>
          </ul>
        </div>

        {FOOTER.columns.map((col) => (
          <div key={col.title} className="tf-footer-col">
            <h3>{col.title}</h3>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <FooterNavLink link={link} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="tf-footer-bottom">
        <span>© {new Date().getFullYear()} TrustiFix. All rights reserved.</span>
      </div>
    </footer>
  );
}
