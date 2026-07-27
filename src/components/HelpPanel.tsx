import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type ChatMsg = { from: "them" | "me"; text: string };

type QuickAction = {
  label: string;
  to?: string;
  prompt?: string;
  needsAuth?: boolean;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Find a provider", to: "/services", prompt: "I need to find a provider" },
  { label: "Book fast", to: "/#quick-book", prompt: "Help me book quickly" },
  { label: "Emergency", to: "/services?q=Emergency", prompt: "I need emergency help" },
  { label: "Trust & Safety", to: "/trust-safety", prompt: "Tell me about trust and safety" },
  { label: "My bookings", to: "/dashboard", prompt: "Where are my bookings?", needsAuth: true },
  { label: "Messages", to: "/messages", prompt: "Open my messages", needsAuth: true },
  { label: "Wallet", to: "/wallet", prompt: "I need help with my wallet", needsAuth: true },
  { label: "Become a pro", to: "/become-provider", prompt: "I want to become a provider" },
];

function assistantReply(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("emergency") || lower.includes("urgent") || lower.includes("24")) {
    return "For urgent jobs, use Emergency help or search plumbing, locksmith, or AC repair. 24/7 pros are marked on Services.";
  }
  if (lower.includes("book") || lower.includes("fast") || lower.includes("60")) {
    return "Use Book in 60 seconds on the homepage — pick a service, choose a time, then confirm a nearby pro.";
  }
  if (lower.includes("provider") || lower.includes("find") || lower.includes("near")) {
    return "Open Find a provider to browse by area, or use the map on the homepage after setting your location.";
  }
  if (lower.includes("booking") || lower.includes("track") || lower.includes("job")) {
    return "My bookings shows job status, reviews, and disputes. Sign in as a customer if you haven’t yet.";
  }
  if (lower.includes("message") || lower.includes("chat")) {
    return "Messages opens your threads with assigned providers after you book a job.";
  }
  if (lower.includes("wallet") || lower.includes("pay") || lower.includes("money")) {
    return "Wallet holds payment in escrow until the job is completed. Top up there before booking.";
  }
  if (lower.includes("safe") || lower.includes("trust") || lower.includes("escrow") || lower.includes("panic")) {
    return "Trust & Safety covers verification, escrow, and the panic button. Look for the TrustiFix Verified badge on profiles.";
  }
  if (lower.includes("provider") && (lower.includes("become") || lower.includes("join") || lower.includes("earn"))) {
    return "Tap Become a pro to apply. After admin verification you’ll get bookings and wallet payouts.";
  }
  if (lower.includes("become") || lower.includes("join as") || lower.includes("apply")) {
    return "Tap Become a pro to apply. After admin verification you’ll get bookings and wallet payouts.";
  }
  return "Use the quick buttons below to jump to help pages, or ask about booking, emergency, wallet, safety, or messages.";
}

type HelpPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function HelpPanel({ open, onClose }: HelpPanelProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const logRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<ChatMsg[]>([
    {
      from: "them",
      text: "Hi! Chat with me or tap a quick link below to jump to help.",
    },
  ]);

  useEffect(() => {
    if (!open) return;
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [log, open]);

  if (!open) return null;

  function pushChat(userText: string) {
    const trimmed = userText.trim();
    if (!trimmed) return;
    setLog((prev) => [
      ...prev,
      { from: "me", text: trimmed },
      { from: "them", text: assistantReply(trimmed) },
    ]);
    setInput("");
  }

  function onQuick(action: QuickAction) {
    if (action.prompt) pushChat(action.prompt);
    if (!action.to) return;

    const needsAuth = action.needsAuth;
    if (needsAuth && !isAuthenticated) {
      onClose();
      navigate("/auth", { state: { from: action.to } });
      return;
    }
    onClose();
    navigate(action.to);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    pushChat(input);
  }

  return (
    <div
      className="tf-float-chat-panel tf-card tf-help-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      <div className="tf-chat-header">
        <div className="tf-nearby-name-row">
          <div className="tf-nearby-avatar" style={{ width: 40, height: 40, fontSize: "0.9rem" }}>
            TF
          </div>
          <div>
            <strong id="help-title">TrustiFix Help</strong>
            <div className="tf-nearby-available" style={{ fontSize: "0.85rem" }}>
              Chat + quick links
            </div>
          </div>
        </div>
        <button type="button" className="tf-chip" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="tf-chat-log" ref={logRef}>
        {log.map((m, i) => (
          <div
            key={`${m.from}-${i}`}
            className={`tf-bubble ${m.from === "me" ? "tf-bubble-me" : "tf-bubble-them"}`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="tf-help-quick" aria-label="Quick help links">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            className="tf-help-chip"
            onClick={() => onQuick(action)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <form className="tf-chat-compose" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          aria-label="Chat message"
        />
        <button type="submit" className="tf-btn tf-btn-primary">
          Send
        </button>
      </form>

      {!isAuthenticated && (
        <div className="tf-help-footer">
          <Link to="/auth" className="tf-btn tf-btn-secondary" onClick={onClose}>
            Log in for bookings & wallet
          </Link>
        </div>
      )}
    </div>
  );
}
