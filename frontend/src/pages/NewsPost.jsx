// src/pages/NewsPost.jsx
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { NEWS } from '../data/news';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'
  });

/** Single full article block (same layout for all) */
function Article({ post, first = false }) {
  const paragraphs = post.content ? post.content.split(/\n{2,}/g) : [];
  const hasGallery = Array.isArray(post.images) && post.images.length > 0;

  return (
    <article style={{ marginBottom: 36 }}>
      {/* Title styles: big h1 for first, smaller for the rest */}
      {first ? (
        <h1 className="h2" style={{ margin: '8px 0 6px' }}>{post.title}</h1>
      ) : (
        <h2 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 22 }}>{post.title}</h2>
      )}
      <div style={{ opacity: .7, marginBottom: 18 }}>{fmtDate(post.date)}</div>

      {post.cover_url ? (
        <img
          src={post.cover_url}
          alt=""
          style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 14, marginBottom: 18 }}
          loading="lazy"
        />
      ) : null}

      <div style={{ lineHeight: 1.8, fontSize: 16, marginBottom: hasGallery ? 24 : 0 }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ margin: '0 0 14px' }} dangerouslySetInnerHTML={{ __html: para }} />
        ))}
      </div>

      {/* Small square gallery like Music (optional) */}
      {hasGallery && (
        <>
          <h3 style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 18 }}>Gallery</h3>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 260px))',
              justifyContent: 'start'
            }}
          >
            {post.images.map((src, idx) => (
              <figure key={idx} style={{ margin: 0, width: '100%' }}>
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: 16,
                    display: 'block'
                  }}
                />
              </figure>
            ))}
          </div>
        </>
      )}
    </article>
  );
}

export default function NewsPost() {
  const { slug } = useParams();

  // All posts newest → oldest
  const sorted = useMemo(
    () => [...NEWS].sort((a, b) => new Date(b.date) - new Date(a.date)),
    []
  );

  // Put the clicked article first, then the rest
  const ordered = useMemo(() => {
    const idx = sorted.findIndex(n => n.slug === slug);
    if (idx === -1) return sorted;
    return [sorted[idx], ...sorted.filter((_, i) => i !== idx)];
  }, [slug, sorted]);

  // If the slug didn't match anything, fall back to full list
  const showBack = true;

  return (
    <div className="section-white">
      <section className="container" style={{ padding: '64px 0' }}>
        {showBack && (
          <Link className="btn" to="/news" style={{ marginBottom: 16, display: 'inline-block' }}>
            ← Back to News
          </Link>
        )}

        {ordered.map((p, i) => (
          <div key={p.slug}>
            {i > 0 && (
              <div
                style={{
                  height: 1,
                  background: 'rgba(0,0,0,.08)',
                  margin: '24px 0'
                }}
              />
            )}
            <Article post={p} first={i === 0} />
          </div>
        ))}
      </section>
    </div>
  );
}
