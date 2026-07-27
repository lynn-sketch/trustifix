import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import {
  displayName,
  providerLabel,
  usePlatform,
} from "../contexts/PlatformContext";
import { BOOKING_STATUS_LABELS } from "../lib/booking";

export function MessagesPage() {
  const { user } = useAuth();
  const {
    threadsForUser,
    messagesForThread,
    sendMessage,
    markThreadRead,
    bookings,
  } = usePlatform();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState("");

  const threads = useMemo(
    () => (user ? threadsForUser(user.id) : []),
    [threadsForUser, user],
  );

  const activeId = params.get("thread") ?? threads[0]?.id ?? null;
  const active = threads.find((t) => t.id === activeId) ?? null;
  const messages = useMemo(
    () => (active ? messagesForThread(active.id) : []),
    [active, messagesForThread],
  );
  const booking = active
    ? bookings.find((b) => b.id === active.bookingId)
    : undefined;

  useEffect(() => {
    if (user && active) markThreadRead(active.id, user.id);
  }, [user, active, markThreadRead, messages.length]);

  if (!user) return null;

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!active || !user) return;
    sendMessage(active.id, user.id, draft);
    setDraft("");
  }

  function otherParty(thread: { customerId: string; providerId: string }) {
    return user!.id === thread.customerId ? thread.providerId : thread.customerId;
  }

  return (
    <div>
      <Navbar />
      <main className="tf-page tf-messages">
        <header className="tf-page-header">
          <h1>Messages</h1>
          <p className="tf-muted">Chat tied to each booking — status updates appear as system notes.</p>
        </header>

        {threads.length === 0 ? (
          <div className="tf-card" style={{ padding: "1.25rem" }}>
            <p>No conversations yet.</p>
            <p className="tf-muted">A thread is created automatically when you book a provider.</p>
            <Link to="/services" className="tf-btn tf-btn-primary" style={{ marginTop: "0.75rem" }}>
              Find a provider
            </Link>
          </div>
        ) : (
          <div className="tf-messages-layout">
            <aside className="tf-card tf-thread-list">
              {threads.map((t) => {
                const other = otherParty(t);
                const selected = t.id === active?.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`tf-thread-item ${selected ? "tf-thread-active" : ""}`}
                    onClick={() => setParams({ thread: t.id })}
                  >
                    <strong>
                      {other === t.providerId ? providerLabel(other) : displayName(other)}
                    </strong>
                    <div className="tf-muted" style={{ fontSize: "0.85rem" }}>
                      {new Date(t.updatedAt).toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </aside>

            <section className="tf-card tf-chat-panel">
              {active ? (
                <>
                  <div className="tf-chat-header">
                    <div>
                      <strong>
                        {user.id === active.customerId
                          ? providerLabel(active.providerId)
                          : displayName(active.customerId)}
                      </strong>
                      {booking && (
                        <div className="tf-muted">
                          {booking.serviceCategory} · {BOOKING_STATUS_LABELS[booking.status]}
                        </div>
                      )}
                    </div>
                    <Link
                      to={user.role === "provider" ? "/provider-dashboard" : "/dashboard"}
                      className="tf-chip"
                    >
                      View booking
                    </Link>
                  </div>

                  <div className="tf-chat-log">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`tf-bubble ${
                          m.system
                            ? "tf-bubble-system"
                            : m.senderId === user.id
                              ? "tf-bubble-me"
                              : "tf-bubble-them"
                        }`}
                      >
                        {!m.system && (
                          <div className="tf-bubble-meta">
                            {m.senderId === user.id ? "You" : displayName(m.senderId)}
                          </div>
                        )}
                        <div>{m.body}</div>
                        <div className="tf-bubble-time">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form className="tf-chat-compose" onSubmit={onSend}>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type a message…"
                      aria-label="Message"
                    />
                    <button type="submit" className="tf-btn tf-btn-primary" disabled={!draft.trim()}>
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <p className="tf-muted" style={{ padding: "1rem" }}>
                  Select a conversation.
                </p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
