import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Float sections into view on scroll; resets when leaving so it replays. */
export function useScrollReveal(rootSelector = ".tf-route-shell") {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("is-revealed");
          } else {
            el.classList.remove("is-revealed");
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootSelector, pathname]);
}
