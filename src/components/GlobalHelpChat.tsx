import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { ChatFab } from "./ProviderMap";
import { HelpPanel } from "./HelpPanel";

/** Floating help chat available on every page */
export function GlobalHelpChat() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return createPortal(
    <div className="tf-float-chat">
      <HelpPanel open={open} onClose={() => setOpen(false)} />
      {!open && <ChatFab onClick={() => setOpen(true)} />}
    </div>,
    document.body,
  );
}
