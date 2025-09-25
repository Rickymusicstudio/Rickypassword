 function ShareBar({ url, title }) {
  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link copied!')
      }
    } catch (_) {}
  }

  const enc = encodeURIComponent
  const xHref = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`
  const waHref = `https://wa.me/?text=${enc(`${title} — ${url}`)}`

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '10px 0 18px' }}>
      <button onClick={onShare} className="btn" style={{ padding: '8px 12px' }}>
        Share
      </button>
      <button
        className="btn btn-ghost"
        style={{ padding: '8px 12px' }}
        onClick={async () => {
          await navigator.clipboard.writeText(url)
          alert('Link copied!')
        }}
      >
        Copy link
      </button>
      <a className="btn btn-ghost" href={waHref} target="_blank" rel="noreferrer">WhatsApp</a>
      <a className="btn btn-ghost" href={xHref} target="_blank" rel="noreferrer">X</a>
    </div>
  )
}
