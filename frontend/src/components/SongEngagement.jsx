// src/components/SongEngagement.jsx — like button + comments for a song (needs supabase/engagement.sql)
import { useEffect, useState } from 'react'
import { getLikeCount, hasLiked, listComments, postComment, savedName, setLike } from '../lib/engagement'
import { CommentIcon, HeartIcon } from './Icons.jsx'

const ago = (iso) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function LikeButton({ track }) {
  const [liked, setLiked] = useState(() => hasLiked(track.sku))
  const [count, setCount] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLiked(hasLiked(track.sku))
    getLikeCount(track.sku).then(setCount).catch(() => setCount(null))
  }, [track.sku])

  const toggle = async () => {
    const next = !liked
    setBusy(true)
    setLiked(next) // instant feedback
    setCount((c) => (c == null ? c : c + (next ? 1 : -1)))
    try { setCount(await setLike(track.sku, next)) } catch { setLiked(!next); setCount((c) => (c == null ? c : c + (next ? -1 : 1))) }
    setBusy(false)
  }

  return (
    <button className={`like-btn ${liked ? 'is-liked' : ''}`} onClick={toggle} disabled={busy} aria-pressed={liked}
      aria-label={liked ? 'Unlike this song' : 'Like this song'}>
      <HeartIcon filled={liked} width={22} height={22} />
      <span>{count ?? ''}</span>
    </button>
  )
}

export function Comments({ track }) {
  const [items, setItems] = useState(null)
  const [name, setName] = useState(savedName)
  const [body, setBody] = useState('')
  const [status, setStatus] = useState({ busy: false, err: '' })

  useEffect(() => {
    setItems(null)
    listComments(track.sku).then(setItems).catch(() => setItems([]))
  }, [track.sku])

  const submit = async (e) => {
    e.preventDefault()
    if (new FormData(e.currentTarget).get('website')) return // bots fill the hidden field
    if (!name.trim() || !body.trim()) return setStatus({ busy: false, err: 'Add your name and a message.' })
    setStatus({ busy: true, err: '' })
    try {
      const c = await postComment(track.sku, name, body)
      setItems((list) => [c, ...(list || [])])
      setBody('')
      setStatus({ busy: false, err: '' })
    } catch (err) {
      setStatus({ busy: false, err: err.message })
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-title">
      <h2 id="comments-title" className="section-title">
        <CommentIcon width={26} height={26} /> Comments {items?.length ? <span className="muted">({items.length})</span> : null}
      </h2>

      <form className="comment-form" onSubmit={submit}>
        <input type="text" name="website" tabIndex="-1" autoComplete="off" hidden />
        <input className="input" placeholder="Your name" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" />
        <textarea className="input" placeholder={`What do you think of "${track.title}"?`} maxLength={500} rows={3}
          value={body} onChange={(e) => setBody(e.target.value)} aria-label="Your comment" />
        <div className="comment-form-foot">
          <span className="muted">{body.length}/500</span>
          <button className="btn btn-primary btn-sm" disabled={status.busy}>{status.busy ? 'Posting…' : 'Post comment'}</button>
        </div>
        {status.err && <p className="form-status"><span className="err">{status.err}</span></p>}
      </form>

      {items === null ? <p className="muted">Loading comments…</p> : items.length === 0 ? (
        <p className="muted">No comments yet. Be the first!</p>
      ) : (
        <ul className="comment-list">
          {items.map((c) => (
            <li key={c.id}>
              <div className="comment-avatar" aria-hidden="true">{c.name.trim()[0]?.toUpperCase()}</div>
              <div>
                <div className="comment-head"><strong>{c.name}</strong><span className="muted">{ago(c.created_at)}</span></div>
                <p>{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

