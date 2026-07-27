import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { usePlatform } from "../contexts/PlatformContext";

export function PanicButton() {
  const { isAuthenticated, user } = useAuth();
  const { location } = useLocation();
  const { triggerPanic } = usePlatform();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");

  if (!isAuthenticated || !user) return null;

  function confirm() {
    triggerPanic({
      userId: user!.id,
      note: note.trim() || "Emergency assistance requested",
      lat: location.lat,
      lng: location.lng,
      areaLabel: location.label,
    });
    setSent(true);
    setOpen(false);
    window.setTimeout(() => setSent(false), 5000);
  }

  return (
    <>
      <button
        type="button"
        className="tf-panic"
        aria-label="Safety panic button"
        onClick={() => setOpen(true)}
      >
        !
      </button>

      {sent && (
        <div className="tf-panic-toast" role="status">
          Safety alert sent to TrustiFix admin + your active booking contacts.
        </div>
      )}

      {open && (
        <div className="tf-panic-modal" role="dialog" aria-modal="true" aria-labelledby="panic-title">
          <div className="tf-card tf-panic-panel">
            <h2 id="panic-title">Send safety alert?</h2>
            <p className="tf-muted">
              Shares your approximate location ({location.label}) with TrustiFix safety and notifies
              admins immediately.
            </p>
            <label className="tf-form" style={{ marginTop: "0.75rem" }}>
              Optional note
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What’s happening?"
              />
            </label>
            <div className="tf-chip-row" style={{ marginTop: "1rem" }}>
              <button type="button" className="tf-btn tf-btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="tf-btn tf-panic-confirm" onClick={confirm}>
                Send alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
