// src/pages/admin/Admin.jsx — content admin: Music, News, Gallery
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { isAdmin, signOut } from './adminApi'
import MusicTab from './MusicTab.jsx'
import NewsTab from './NewsTab.jsx'
import GalleryTab from './GalleryTab.jsx'
import CommentsTab from './CommentsTab.jsx'
import { importLegacy } from './legacyImport'
import './admin.css'

const TABS = [
  { key: 'music', label: 'Music', Component: MusicTab },
  { key: 'news', label: 'News', Component: NewsTab },
  { key: 'gallery', label: 'Gallery', Component: GalleryTab },
  { key: 'comments', label: 'Comments', Component: CommentsTab },
]

export function NotConfigured() {
  return (
    <div className="admin-center">
      <div className="admin-card" style={{ maxWidth: 520 }}>
        <h1 className="admin-title">Admin isn’t connected yet</h1>
        <p className="muted">
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to the site’s environment
          (see <code>ADMIN_SETUP.md</code>), then reload this page.
        </p>
      </div>
    </div>
  )
}

/** Shown while the database is empty: one click copies the site's built-in content in. */
function ImportBanner({ notify, onDone }) {
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const count = (t) => supabase.from(t).select('id', { count: 'exact', head: true }).then((r) => r.count || 0)
    Promise.all(['songs', 'news', 'gallery'].map(count))
      .then((n) => setShow(n.every((c) => c === 0)))
      .catch(() => {})
  }, [])

  if (!show) return null

  const run = async () => {
    setBusy(true)
    try {
      const c = await importLegacy(supabase)
      notify(`Imported ${c.songs} songs, ${c.news} articles and ${c.gallery} photos`)
      setShow(false)
      onDone()
    } catch (e) {
      notify(e.message, 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-card import-banner">
      <div>
        <strong>Bring in your existing music, news and photos</strong>
        <p className="muted">
          The songs, articles and gallery photos already on the website aren’t in the admin yet.
          Import them once and you can edit or delete them here.
        </p>
      </div>
      <button className="btn btn-primary" onClick={run} disabled={busy}>
        {busy ? 'Importing…' : 'Import existing content'}
      </button>
    </div>
  )
}

export default function Admin() {
  const [state, setState] = useState({ status: 'loading', email: '' }) // loading | signedOut | denied | ok
  const [tab, setTab] = useState(() => sessionStorage.getItem('rp:admin:tab') || 'music')
  const [toast, setToast] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    if (!supabase) return
    const check = async (session) => {
      if (!session) return setState({ status: 'signedOut', email: '' })
      try {
        setState({ status: (await isAdmin()) ? 'ok' : 'denied', email: session.user.email })
      } catch {
        setState({ status: 'denied', email: session.user.email })
      }
    }
    supabase.auth.getSession().then(({ data }) => check(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (!session) check(null) })
    return () => sub.subscription.unsubscribe()
  }, [])

  const notify = useCallback((text, kind = 'ok') => {
    clearTimeout(timer.current)
    setToast({ text, kind })
    timer.current = setTimeout(() => setToast(null), kind === 'err' ? 6000 : 2500)
  }, [])

  if (!supabase) return <NotConfigured />
  if (state.status === 'loading') return <div className="admin-center muted">Loading…</div>
  if (state.status === 'signedOut') return <Navigate to="/admin/login" replace />
  if (state.status === 'denied') {
    return (
      <div className="admin-center">
        <div className="admin-card" style={{ maxWidth: 460 }}>
          <h1 className="admin-title">No admin access</h1>
          <p className="muted">{state.email} is signed in but isn’t listed as an admin.</p>
          <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      </div>
    )
  }

  const Active = (TABS.find((t) => t.key === tab) || TABS[0]).Component
  const choose = (key) => { setTab(key); sessionStorage.setItem('rp:admin:tab', key) }

  return (
    <div className="admin">
      <header className="admin-top">
        <div className="container admin-top-inner">
          <Link to="/" className="brand">Ricky<span>Password</span> <small>Admin</small></Link>
          <nav className="admin-tabs" aria-label="Admin sections">
            {TABS.map((t) => (
              <button key={t.key} className={t.key === tab ? 'active' : ''} onClick={() => choose(t.key)}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="admin-user">
            <a className="btn btn-ghost btn-sm" href="/" target="_blank" rel="noreferrer">View site</a>
            <button className="btn btn-ghost btn-sm" onClick={signOut} title={state.email}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="container admin-main">
        <ImportBanner notify={notify} onDone={() => setReloadKey((k) => k + 1)} />
        <Active key={`${tab}-${reloadKey}`} notify={notify} />
      </main>

      {toast && <div className={`admin-toast ${toast.kind}`} role="status">{toast.text}</div>}
    </div>
  )
}
