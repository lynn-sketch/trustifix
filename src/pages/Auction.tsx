import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { useAuth } from "../contexts/AuthContext";
import { displayName, usePlatform, type AuctionListing } from "../contexts/PlatformContext";
import { formatUGX } from "../lib/format";

const PRESET_PHOTOS = [
  "/images/services/ac.jpg",
  "/images/categories/vehicle.jpg",
  "/images/categories/handyman.jpg",
  "/images/services/carwash.jpg",
  "/images/categories/home.jpg",
  "/images/categories/tech.jpg",
  "/images/categories/solar.jpg",
  "/images/services/locksmith.jpg",
  "/images/services/laundry.jpg",
  "/images/services/plumbing.jpg",
  "/images/services/cleaning.jpg",
  "/images/services/carpet.jpg",
];

function ListingCard({
  listing,
  userId,
  bidDraft,
  onBidDraft,
  onBid,
}: {
  listing: AuctionListing;
  userId?: string;
  bidDraft: string;
  onBidDraft: (v: string) => void;
  onBid: () => void;
}) {
  const gallery = listing.images?.length
    ? listing.images
    : [listing.imageUrl ?? "/images/categories/handyman.jpg"];
  const [photo, setPhoto] = useState(0);
  const top = listing.bids[0];
  const minNext = (top?.amountCents ?? listing.startingBidCents) + 500000;
  const endsSoon =
    new Date(listing.endsAt).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;

  return (
    <article className="tf-auc-card">
      <div className="tf-auc-media">
        <img src={gallery[photo] ?? gallery[0]} alt={listing.title} loading="lazy" />
        <div className="tf-auc-media-tags">
          <span className="tf-badge">{listing.category}</span>
          {endsSoon && <span className="tf-auc-urgent">Ending soon</span>}
        </div>
        {gallery.length > 1 && (
          <div className="tf-auc-thumbs" aria-label="Photos">
            {gallery.map((src, i) => (
              <button
                key={src + i}
                type="button"
                className={i === photo ? "is-on" : ""}
                onClick={() => setPhoto(i)}
                aria-label={`Photo ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tf-auc-body">
        <h2>{listing.title}</h2>
        <p className="tf-muted">{listing.description || "No description"}</p>
        <div className="tf-auc-meta">
          <strong>
            {top
              ? `Top bid ${formatUGX(top.amountCents)}`
              : `Starts at ${formatUGX(listing.startingBidCents)}`}
          </strong>
          <span className="tf-muted">
            Ends {new Date(listing.endsAt).toLocaleDateString()} · Seller{" "}
            {displayName(listing.sellerId)}
            {top ? ` · lead ${displayName(top.bidderId)}` : ""}
          </span>
        </div>

        {userId && userId !== listing.sellerId ? (
          <div className="tf-inline-form">
            <input
              type="number"
              min={Math.round(minNext / 100)}
              placeholder={`Min ${Math.round(minNext / 100).toLocaleString()}`}
              value={bidDraft}
              onChange={(e) => onBidDraft(e.target.value)}
            />
            <button type="button" className="tf-btn tf-btn-primary" onClick={onBid}>
              Place bid
            </button>
          </div>
        ) : userId === listing.sellerId ? (
          <span className="tf-chip">Your listing</span>
        ) : (
          <Link to="/auth" state={{ from: "/auction" }} className="tf-btn tf-btn-secondary">
            Sign in to bid
          </Link>
        )}
      </div>
    </article>
  );
}

export function AuctionPage() {
  const { user } = useAuth();
  const { auctionListings, placeBid, createAuctionListing } = usePlatform();
  const [bidDrafts, setBidDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tools");
  const [starting, setStarting] = useState("50000");
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0]);
  const [filter, setFilter] = useState("All");

  const openListings = useMemo(() => {
    return [...auctionListings]
      .filter((l) => l.status === "open")
      .filter((l) => filter === "All" || l.category === filter)
      .sort((a, b) => a.endsAt.localeCompare(b.endsAt));
  }, [auctionListings, filter]);

  const categories = useMemo(() => {
    const set = new Set(auctionListings.map((l) => l.category));
    return ["All", ...Array.from(set)];
  }, [auctionListings]);

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const startingBidCents = Math.round(Number(starting) * 100);
    if (!title.trim() || !Number.isFinite(startingBidCents) || startingBidCents <= 0) {
      setError("Enter a title and valid starting bid (UGX).");
      return;
    }
    createAuctionListing({
      sellerId: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      startingBidCents,
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl,
      images: [imageUrl, ...PRESET_PHOTOS.filter((p) => p !== imageUrl).slice(0, 2)],
    });
    setTitle("");
    setDescription("");
    setStarting("50000");
    setShowForm(false);
    setError("");
  }

  function onBid(listingId: string) {
    if (!user) return;
    setError("");
    const raw = bidDrafts[listingId];
    const amountCents = Math.round(Number(raw) * 100);
    try {
      placeBid(listingId, user.id, amountCents);
      setBidDrafts((prev) => ({ ...prev, [listingId]: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bid failed");
    }
  }

  return (
    <div>
      <Navbar />
      <main className="tf-page tf-auction-page">
        <header className="tf-page-header">
          <p className="tf-badge">Marketplace</p>
          <h1>Auction & Swap</h1>
          <p className="tf-muted">
            Browse tools, parts, and gear with photos. Bid live — highest bid wins when the timer
            ends.
          </p>
          <button
            type="button"
            className="tf-btn tf-btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Close form" : "List an item"}
          </button>
        </header>

        <div className="tf-auc-hero-strip" aria-hidden>
          {PRESET_PHOTOS.slice(0, 8).map((src) => (
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </div>

        {showForm && user && (
          <form
            className="tf-form tf-card tf-auc-form"
            onSubmit={onCreate}
          >
            <h2>New listing</h2>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Tools</option>
                <option>Parts</option>
                <option>Electronics</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Starting bid (UGX)
              <input
                type="number"
                min={1000}
                value={starting}
                onChange={(e) => setStarting(e.target.value)}
                required
              />
            </label>
            <label>
              Description
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <fieldset className="tf-auc-photo-pick">
              <legend>Cover photo</legend>
              <div className="tf-auc-photo-grid">
                {PRESET_PHOTOS.map((src) => (
                  <button
                    key={src}
                    type="button"
                    className={imageUrl === src ? "is-on" : ""}
                    onClick={() => setImageUrl(src)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="tf-btn tf-btn-primary">
              Publish listing (ends in 3 days)
            </button>
          </form>
        )}

        {showForm && !user && (
          <p className="tf-muted">
            <Link to="/auth" state={{ from: "/auction" }}>
              Sign in
            </Link>{" "}
            to list an item.
          </p>
        )}

        {error && <p className="tf-error">{error}</p>}

        <div className="tf-chip-row tf-auc-filters" role="tablist" aria-label="Categories">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`tf-chip ${filter === c ? "tf-chip-active" : ""}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {openListings.length === 0 ? (
          <div className="tf-card" style={{ padding: "1.25rem" }}>
            <p>No open auctions in this category.</p>
            <p className="tf-muted">List an item or pick another filter.</p>
          </div>
        ) : (
          <div className="tf-auc-grid">
            {openListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                userId={user?.id}
                bidDraft={bidDrafts[listing.id] ?? ""}
                onBidDraft={(v) => setBidDrafts((prev) => ({ ...prev, [listing.id]: v }))}
                onBid={() => onBid(listing.id)}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
