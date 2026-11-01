// src/pages/admin/NewsTab.jsx — write / edit / delete news articles
import { useCallback, useEffect, useState } from 'react'
import { list, niceError, remove, removeMedia, save, slugify, today } from './adminApi'
import { Field, MultiImageField, Toggle, UploadField } from './fields.jsx'
import { fmtDate } from '../../lib/site'
import Img from '../../components/Img.jsx'

const EMPTY = { title: '', slug: '', date: today(), excerpt: '', content: '', cover_url: '', images: [], published: true }

export default function NewsTab({ notify }) {
  const [rows, setRows] = useState(null)
  const [edit, setEdit] = useState(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    list('news', [['date', false], ['created_at', false]]).then(setRows).catch((e) => { setRows(false); notify(niceError(e), 'err') })
  }, [notify])
  useEffect(load, [load])

  const set = (k) => (v) => setEdit((r) => ({ ...r, [k]: v }))
  const setTitle = (title) =>
    setEdit((r) => ({ ...r, title, slug: slugTouched || r.id ? r.slug : slugify(title) }))

  const open = (row) => { setSlugTouched(false); setEdit({ ...EMPTY, ...row, images: row?.images || [] }) }

  const onSave = async (e) => {
    e.preventDefault()
    const slug = slugify(edit.slug || edit.title)
    if (!slug) return notify('Add a title first.', 'err')
    setSaving(true)
    try {
      const { id, title, date, excerpt, content, cover_url, images, published } = edit
      await save('news', {
        id, slug, title: title.trim(), date: date || today(), excerpt: excerpt.trim() || null,
        content: content.trim(), cover_url: cover_url || null, images, published,
      })
      notify(id ? 'Article updated' : 'Article published')
      setEdit(null)
      load()
    } catch (err) { notify(niceError(err), 'err') } finally { setSaving(false) }
  }

  const onDelete = async (row) => {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    try {
      await remove('news', row.id)
      await Promise.all([row.cover_url, ...(row.images || [])].map(removeMedia)).catch(() => {})
      notify('Article deleted')
      load()
    } catch (e) { notify(niceError(e), 'err') }
  }

  if (edit) {
    return (
      <form className="admin-card admin-form" onSubmit={onSave}>
        <div className="admin-form-head">
          <h2>{edit.id ? 'Edit article' : 'New article'}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancel</button>
        </div>

        <div className="form-cols">
          <div className="form-stack">
            <Field label="Title *">
              <input className="input" required value={edit.title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ricky Password releases new song" />
            </Field>
            <Field label="Link" hint={`rickypassword.com/news/${slugify(edit.slug || edit.title) || '…'}`}>
              <input
                className="input"
                value={edit.slug}
                onChange={(e) => { setSlugTouched(true); set('slug')(e.target.value) }}
                onBlur={(e) => set('slug')(slugify(e.target.value))}
                placeholder="made from the title"
              />
            </Field>
            <Field label="Date">
              <input className="input" type="date" value={edit.date || ''} onChange={(e) => set('date')(e.target.value)} />
            </Field>
          </div>
          <UploadField label="Cover photo (shown on cards and when shared)" kind="image" folder="news" value={edit.cover_url} onChange={set('cover_url')} onError={(m) => notify(m, 'err')} />
        </div>

        <Field label="Short summary" hint="One or two sentences shown on the news list and in WhatsApp/Facebook previews.">
          <textarea className="input" rows={2} value={edit.excerpt || ''} onChange={(e) => set('excerpt')(e.target.value)} />
        </Field>
        <Field label="Story" hint="Leave an empty line between paragraphs.">
          <textarea className="input story" rows={14} value={edit.content || ''} onChange={(e) => set('content')(e.target.value)} />
        </Field>
        <MultiImageField label="More photos (optional)" folder="news" value={edit.images} onChange={set('images')} onError={(m) => notify(m, 'err')} />
        <Toggle label="Published (visible on the site)" checked={edit.published} onChange={set('published')} />

        <div className="admin-form-foot">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : edit.id ? 'Save changes' : 'Publish article'}</button>
        </div>
      </form>
    )
  }

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>News</h2>
          <p className="muted">{rows === false ? 'Could not load. Reload the page to try again.' : rows ? `${rows.length} articles` : 'Loading…'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => open(null)}>+ New article</button>
      </div>

      <div className="admin-list">
        {(rows || []).map((r) => (
          <div className="admin-row" key={r.id}>
            {r.cover_url || r.images?.[0] ? <Img src={r.cover_url || r.images[0]} alt="" /> : <div className="admin-row-ph" />}
            <div className="admin-row-main">
              <strong>{r.title}</strong>
              <span className="muted">{fmtDate(r.date)}</span>
            </div>
            {!r.published && <span className="badge">Draft</span>}
            <a className="btn btn-ghost btn-sm" href={`/news/${r.slug}`} target="_blank" rel="noreferrer">View</a>
            <button className="btn btn-ghost btn-sm" onClick={() => open(r)}>Edit</button>
            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => onDelete(r)}>Delete</button>
          </div>
        ))}
        {rows?.length === 0 && <p className="muted admin-empty">No articles yet. Write your first one.</p>}
      </div>
    </section>
  )
}
