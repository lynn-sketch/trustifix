import { Link, useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SiteFooter } from "../components/SiteFooter";
import { getPost, relatedPosts } from "../data/blog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;

  if (!post) {
    return (
      <div>
        <Navbar />
        <main className="tf-page">
          <h1>Article not found</h1>
          <Link to="/blog">Back to blog</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const related = relatedPosts(post.slug);

  return (
    <div className="tf-blog-page">
      <Navbar />

      <article>
        <header className="tf-article-hero">
          <img src={post.image} alt="" className="tf-article-hero-media" />
          <div className="tf-article-hero-shade" aria-hidden />
          <div className="tf-article-hero-inner">
            <Link to="/blog" className="tf-article-back">
              ← All articles
            </Link>
            <span className="tf-blog-kicker">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="tf-blog-byline tf-blog-byline-light">
              <span>{post.author}</span>
              <span aria-hidden>·</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span aria-hidden>·</span>
              <span>{post.minutes} min read</span>
            </div>
          </div>
        </header>

        <div className="tf-article-shell">
          <p className="tf-article-deck">{post.excerpt}</p>
          <div className="tf-article-body">
            {post.body.map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </div>

          <div className="tf-article-actions">
            <Link to="/services" className="tf-btn tf-btn-primary">
              Find a provider
            </Link>
            <Link to="/trust-safety" className="tf-btn tf-btn-secondary">
              Trust & Safety
            </Link>
          </div>

          {related.length > 0 && (
            <section className="tf-article-related" aria-label="Related articles">
              <h2>Keep reading</h2>
              <div className="tf-blog-tiles">
                {related.map((item, i) => (
                  <Link
                    key={item.slug}
                    to={`/blog/${item.slug}`}
                    className="tf-blog-tile"
                    style={{ animationDelay: `${0.05 * i}s` }}
                  >
                    <div className="tf-blog-tile-media">
                      <img src={item.image} alt="" loading="lazy" />
                      <span className="tf-blog-tile-cat">{item.category}</span>
                    </div>
                    <div className="tf-blog-tile-body">
                      <h3>{item.title}</h3>
                      <p>{item.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
