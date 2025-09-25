// src/pages/Shows.jsx

export default function Shows() {
  // --- Update this array with real dates (leave [] to show the empty-state) ---
  const rawShows = [
    // Example:
    // { date: '2025-10-05', venue: 'Kigali Arena', city: 'Kigali, RW', link: 'https://tickets.example.com/kigali' },
    // { date: '2025-11-12', venue: 'BK Arena',     city: 'Kigali, RW', link: 'https://tickets.example.com/bk' },
  ];

  // Socials for the empty state
  const SOCIALS = {
    instagram: 'https://www.instagram.com/rickypassword/',
    youtube:   'https://youtube.com/@rickypasswordrwa?si=hJBfh9Ed7_JnlZhx',
  };

  // Helpers
  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upcoming only, sorted soonest → latest
  const shows = [...rawShows]
    .filter(s => s?.date && new Date(s.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const hasShows = shows.length > 0;

  return (
    <section className="container" style={{ padding: '64px 0' }}>
      <h1 className="h2" style={{ color: '#fff', marginBottom: 24 }}>Shows</h1>

      {/* Empty state */}
      {!hasShows && (
        <div
          className="card"
          style={{
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            borderRadius: 14,
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
              No upcoming shows announced
            </div>
            <div style={{ opacity: 0.85, lineHeight: 1.6 }}>
              We’re planning the next dates. Follow for updates and be the first to know when new shows drop.
              For bookings and press, please{' '}
              <a href="/contact" style={{ color: '#fff' }}>contact us</a>.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a className="btn" href={SOCIALS.instagram} target="_blank" rel="noreferrer">
              Follow on Instagram
            </a>
            <a className="btn" href={SOCIALS.youtube} target="_blank" rel="noreferrer">
              Subscribe on YouTube
            </a>
            <a className="btn" href="/contact">Book Ricky Password</a>
          </div>
        </div>
      )}

      {/* Upcoming list */}
      {hasShows && (
        <div className="card" style={{ padding: 0, borderRadius: 14 }}>
          {shows.map((s, i) => (
            <div
              key={`${s.date}-${s.venue}-${i}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 1fr auto',
                gap: 12,
                padding: '16px 18px',
                borderBottom: i !== shows.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none',
                alignItems: 'center',
              }}
            >
              <div style={{ opacity: 0.85 }}>{fmtDate(s.date)}</div>
              <div style={{ fontWeight: 700 }}>{s.venue}</div>
              <div style={{ opacity: 0.85 }}>{s.city}</div>
              {s.link ? (
                <a className="btn" href={s.link} target="_blank" rel="noreferrer">Tickets</a>
              ) : (
                <span style={{ opacity: 0.7, fontSize: 14 }}>Details soon</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
