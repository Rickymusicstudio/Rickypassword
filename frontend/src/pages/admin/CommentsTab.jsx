// src/pages/admin/CommentsTab.jsx — read and delete fans' comments on songs
import { useCallback, useEffect, useState } from 'react'
import { niceError, remove } from './adminApi'
import { supabase } from '../../lib/supabase'

export default function CommentsTab({ notify }) {
  const [rows, setRows] = useState(null)

  const load = useCallback(() => {
    supabase.from('song_comments').select('id,name,body,created_at,songs(title)')
      .order('created_at', { ascending: false }).limit(300)
      .then(({ data, error }) => {
        if (error) {
          setRows(false)
          notify(/song_comments/.test(error.message) ? 'Run supabase/engagement.sql in Supabase first (see ADMIN_SETUP.md).' : niceError(error), 'err')
        } else setRows(data)
      })
  }, [notify])
  useEffect(load, [load])

  const onDelete = async (c) => {
    if (!window.confirm(`Delete this comment from ${c.name}?`)) return
    try {
      await remove('song_comments', c.id)
      setRows((rs) => rs.filter((r) => r.id !== c.id))
      notify('Comment deleted')
    } catch (e) { notify(niceError(e), 'err') }
  }

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Comments</h2>
          <p className="muted">{rows === false ? 'Could not load comments.' : rows ? `${rows.length} comments · newest first` : 'Loading…'}</p>
        </div>
      </div>

      <div className="admin-list">
        {(rows || []).map((c) => (
          <div className="admin-row admin-comment" key={c.id}>
            <div className="admin-row-main">
              <strong>{c.name} <span className="muted">on {c.songs?.title || 'a deleted song'}</span></strong>
              <p>{c.body}</p>
              <span className="muted">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => onDelete(c)}>Delete</button>
          </div>
        ))}
        {rows?.length === 0 && <p className="muted admin-empty">No comments yet.</p>}
      </div>
    </section>
  )
}

