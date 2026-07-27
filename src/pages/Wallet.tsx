import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";
import { formatUGX } from "../lib/format";

const TOP_UP_OPTIONS = [20000000, 50000000, 100000000];

export function WalletPage() {
  const { user } = useAuth();
  const { getBalanceCents, transactions, topUp } = usePlatform();

  if (!user) return null;

  const balance = getBalanceCents(user.id);
  const mine = transactions.filter((t) => t.userId === user.id);

  return (
    <div>
      <Navbar />
      <main className="tf-page">
        <header className="tf-page-header">
          <h1>Wallet</h1>
          <p className="tf-muted">Holds on booking · payouts on completion · refunds on cancel.</p>
        </header>

        <section className="tf-card tf-wallet-hero">
          <div className="tf-muted">Available balance</div>
          <strong style={{ fontSize: "2rem" }}>{formatUGX(balance)}</strong>
          <div className="tf-chip-row" style={{ marginTop: "1rem" }}>
            {TOP_UP_OPTIONS.map((amount) => (
              <button
                key={amount}
                type="button"
                className="tf-btn tf-btn-primary"
                onClick={() => topUp(user.id, amount)}
              >
                Top up {formatUGX(amount)}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "2rem" }}>
          <h2>Transactions</h2>
          {mine.length === 0 ? (
            <p className="tf-muted">No transactions yet.</p>
          ) : (
            <div className="tf-stack">
              {mine.map((txn) => (
                <article key={txn.id} className="tf-card tf-txn-row">
                  <div>
                    <strong>{txn.label}</strong>
                    <div className="tf-muted">
                      {txn.type} · {new Date(txn.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <strong
                    style={{
                      color:
                        txn.type === "hold" ? "var(--tf-danger)" : "var(--tf-success)",
                    }}
                  >
                    {txn.type === "hold" ? "−" : "+"}
                    {formatUGX(txn.amountCents)}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
