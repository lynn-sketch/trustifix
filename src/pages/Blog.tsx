import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { BLOG_POSTS, type BlogPost } from "../data/blog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="tf-blog-featured">
      <img src={post.image} alt="" className="tf-blog-featured-media" />
      <div className="tf-blog-featured-shade" aria-hidden />
      <div className="tf-blog-featured-copy">
        <span className="tf-blog-kicker">{post.category}</span>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <div className="tf-blog-byline">
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{post.minutes} min read</span>
        </div>
      </div>
    </Link>
  );
}

function PostTile({ post, index }: { post: BlogPost; index: number }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="tf-blog-tile"
      style={{ animationDelay: `${0.06 * index}s` }}
    >
      <div className="tf-blog-tile-media">
        <img src={post.image} alt="" loading="lazy" />
        <span className="tf-blog-tile-cat">{post.category}</span>
      </div>
      <div className="tf-blog-tile-body">
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="tf-blog-byline">
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{post.minutes} min</span>
        </div>
      </div>
    </Link>
  );
}

export function BlogPage() {
  const [category, setCategory] = useState("All");
  const posts = useMemo(
    () => [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    [],
  );
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts],
  );
  const filtered = useMemo(
    () => (category === "All" ? posts : posts.filter((p) => p.category === category)),
    [posts, category],
  );
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="tf-blog-page">
      <Navbar />

      <header className="tf-blog-hero">
        <div className="tf-blog-hero-inner">
          <p className="tf-blog-brand">TrustiFix</p>
          <h1>Guides for safer bookings in Kampala</h1>
          <p className="tf-blog-hero-lead">
            Practical tips on payments, verified providers, and getting work done without the guesswork.
          </p>
        </div>
      </header>

      <main className="tf-blog-main">
        <div className="tf-blog-filters" role="tablist" aria-label="Categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={category === cat}
              className={category === cat ? "is-on" : ""}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {featured ? (
          <>
            <FeaturedPost post={featured} />
            {rest.length > 0 && (
              <section className="tf-blog-feed" aria-label="More articles">
                <div className="tf-blog-feed-head">
                  <h2>More from the desk</h2>
                  <p className="tf-muted">{rest.length} article{rest.length === 1 ? "" : "s"}</p>
                </div>
                <div className="tf-blog-tiles">
                  {rest.map((post, i) => (
                    <PostTile key={post.slug} post={post} index={i} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <p className="tf-muted">No articles in this category yet.</p>
        )}

        <aside className="tf-blog-cta-band">
          <div>
            <strong>Need help now?</strong>
            <p>Browse verified providers near you and book with a wallet hold.</p>
          </div>
          <Link to="/services" className="tf-btn tf-btn-primary">
            Find a provider
          </Link>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
