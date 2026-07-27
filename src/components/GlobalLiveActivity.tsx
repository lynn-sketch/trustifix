import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconBolt, LiveFeedIcon } from "./Icons";
import { LIVE_FEED } from "../data/landing";

/** Fixed live-activity toast on every page (viewport, not page bottom). */
export function GlobalLiveActivity() {
  const [feedIndex, setFeedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const feed = LIVE_FEED[feedIndex];

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setFeedIndex((i) => (i + 1) % LIVE_FEED.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [paused]);

  return createPortal(
    <aside
      className="tf-live-toast"
      key={feed.ago + feed.nodes.map((n) => n.text).join("")}
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
    >
      <div className="tf-live-toast-head">
        <IconBolt className="tf-inline-icon tf-live-bolt" /> Live Activity · {feed.ago}
      </div>
      <div className="tf-live-toast-body">
        <span className={`tf-live-icon tf-live-icon-${feed.icon}`} aria-hidden>
          <LiveFeedIcon name={feed.icon} className="tf-inline-icon" />
        </span>
        <p>
          {feed.nodes.map((n, i) =>
            n.bold ? <strong key={i}>{n.text}</strong> : <span key={i}>{n.text}</span>,
          )}
        </p>
      </div>
      <div className="tf-live-toast-dots" aria-hidden>
        {LIVE_FEED.map((_, i) => (
          <button
            key={i}
            type="button"
            className={i === feedIndex ? "is-on" : ""}
            onClick={() => setFeedIndex(i)}
            tabIndex={-1}
          />
        ))}
      </div>
    </aside>,
    document.body,
  );
}
