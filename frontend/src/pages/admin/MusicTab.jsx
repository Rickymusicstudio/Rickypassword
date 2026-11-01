// src/pages/admin/MusicTab.jsx — add / edit / delete songs
import { useCallback, useEffect, useState } from 'react'
import { list, niceError, remove, removeMedia, save, today } from './adminApi'
import { Field, Toggle, UploadField } from './fields.jsx'
import { mediaUrl } from '../../data/tracks'
import { fmtDate } from '../../lib/site'

const EMPTY = {
  title: '', released_at: today(), cover_url: '', audio_url: '', youtube_url: '',
  youtube_only: false, can_download: true, published: true,
}

export default function MusicTab({ notify }) {
  const [rows, setRows] = useState(null)
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    list('songs', [['released_at', false], ['created_at', false]]).then(setRows).catch((e) => { setRows(false); notify(niceError(e), 'err') })
  }, [notify])
  useEffect(load, [load])

  const set = (k) => (v) => setEdit((r) => ({ ...r, [k]: v }))

  const onSave = async (e) => {
    e.preventDefault()
    if (!edit.youtube_only && !edit.audio_url) return notify('Upload an MP3, or tick "YouTube only" and add a link.', 'err')
    if (edit.youtube_only && !edit.youtube_url) return notify('Add the YouTube link.', 'err')
    setSaving(true)
    try {
      const { id, title, released_at, cover_url, audio_url, youtube_url, youtube_only, can_download, published } = edit
      await save('songs', {
        id, title: title.trim(), released_at: released_at || null, cover_url: cover_url || null,
        audio_url: audio_url || null, youtube_url: youtube_url?.trim() || null, youtube_only, can_download, published,
      })
      notify(id ? 'Song updated' : 'Song added')
      setEdit(null)
      load()
    } catch (err) { notify(niceError(err), 'err') } finally { setSaving(false) }
  }

  const onDelete = async (row) => {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    try {
      await remove('songs', row.id)
      await Promise.all([removeMedia(row.cover_url), removeMedia(row.audio_url)]).catch(() => {})
      notify('Song deleted')
      load()
    } catch (e) { notify(niceError(e), 'err') }
  }

  if (edit) {
    return (
      <form className="admin-card admin-form" onSubmit={onSave}>
        <div className="admin-form-head">
          <h2>{edit.id ? 'Edit song' : 'New song'}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancel</button>
        </div>

        <div className="form-cols">
          <div className="form-stack">
            <Field label="Title *">
              <input className="input" required value={edit.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. IMPITAGIHE" />
            </Field>
            <Field label="Release date">
              <input className="input" type="date" value={edit.released_at || ''} onChange={(e) => set('released_at')(e.target.value)} />
            </Field>
            <UploadField label="Audio (MP3)" kind="audio" folder="audio" value={edit.audio_url} onChange={set('audio_url')} onError={(m) => notify(m, 'err')} />
            <Field label="YouTube link" hint="Optional. Used for the “Watch on YouTube” button.">
              <input className="input" type="url" value={edit.youtube_url || ''} onChange={(e) => set('youtube_url')(e.target.value)} placeholder="https://youtube.com/watch?v=…" />
            </Field>
            <div className="toggles">
              <Toggle label="Published (visible on the site)" checked={edit.published} onChange={set('published')} />
              <Toggle label="Fans can download the MP3" checked={edit.can_download} onChange={set('can_download')} />
              <Toggle label="YouTube only (no MP3 on the site)" checked={edit.youtube_only} onChange={set('youtube_only')} />
            </div>
          </div>
          <UploadField label="Cover art" kind="image" folder="covers" value={edit.cover_url} onChange={set('cover_url')} onError={(m) => notify(m, 'err')} />
        </div>

        <div className="admin-form-foot">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : edit.id ? 'Save changes' : 'Add song'}</button>
        </div>
      </form>
    )
  }

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Music</h2>
          <p className="muted">{rows === false ? 'Could not load. Reload the page to try again.' : rows ? `${rows.length} songs` : 'Loading…'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEdit({ ...EMPTY })}>+ New song</button>
      </div>

      <div className="admin-list">
        {(rows || []).map((r) => (
          <div className="admin-row" key={r.id}>
            {r.cover_url ? <img src={mediaUrl(r.cover_url)} alt="" /> : <div className="admin-row-ph" />}
            <div className="admin-row-main">
              <strong>{r.title}</strong>
              <span className="muted">
                {fmtDate(r.released_at) || 'No date'}{r.youtube_only ? ' · YouTube only' : ''}
              </span>
            </div>
            {!r.published && <span className="badge">Hidden</span>}
            <button className="btn btn-ghost btn-sm" onClick={() => setEdit({ ...EMPTY, ...r })}>Edit</button>
            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => onDelete(r)}>Delete</button>
          </div>
        ))}
        {rows?.length === 0 && <p className="muted admin-empty">No songs yet. Add your first one.</p>}
      </div>
    </section>
  )
}
