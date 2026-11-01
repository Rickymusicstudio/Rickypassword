// src/pages/admin/GalleryTab.jsx — upload photos (drag & drop), edit captions, delete
import { useCallback, useEffect, useRef, useState } from 'react'
import { list, niceError, remove, removeMedia, save, today, uploadMedia } from './adminApi'
import Img from '../../components/Img.jsx'
import { CloseIcon } from '../../components/Icons.jsx'

export default function GalleryTab({ notify }) {
  const [rows, setRows] = useState(null)
  const [uploading, setUploading] = useState(0)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const load = useCallback(() => {
    list('gallery', [['taken_on', false], ['created_at', false]]).then(setRows).catch((e) => { setRows(false); notify(niceError(e), 'err') })
  }, [notify])
  useEffect(load, [load])

  const addFiles = async (files) => {
    const photos = [...(files || [])].filter((f) => f.type.startsWith('image/'))
    if (!photos.length) return
    setUploading(photos.length)
    let ok = 0
    for (const f of photos) {
      try {
        const image_url = await uploadMedia(f, 'gallery')
        await save('gallery', { image_url, caption: null, taken_on: today() })
        ok++
      } catch (e) { notify(niceError(e), 'err') }
      setUploading((n) => n - 1)
    }
    if (ok) notify(`${ok} photo${ok > 1 ? 's' : ''} added`)
    if (inputRef.current) inputRef.current.value = ''
    load()
  }

  const saveCaption = async (row, caption) => {
    if ((row.caption || '') === caption) return
    try { await save('gallery', { id: row.id, caption: caption || null }); notify('Caption saved') } catch (e) { notify(niceError(e), 'err') }
  }

  const onDelete = async (row) => {
    if (!window.confirm('Delete this photo?')) return
    try {
      await remove('gallery', row.id)
      await removeMedia(row.image_url).catch(() => {})
      setRows((rs) => rs.filter((r) => r.id !== row.id))
      notify('Photo deleted')
    } catch (e) { notify(niceError(e), 'err') }
  }

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Gallery</h2>
          <p className="muted">{rows === false ? 'Could not load. Reload the page to try again.' : rows ? `${rows.length} photos · newest first` : 'Loading…'}</p>
        </div>
      </div>

      <button
        type="button"
        className={`dropzone ${drag ? 'is-drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
        disabled={uploading > 0}
      >
        <strong>{uploading ? `Uploading ${uploading} photo${uploading > 1 ? 's' : ''}…` : 'Drop photos here or click to choose'}</strong>
        <span className="muted">You can pick several at once. They are resized automatically.</span>
      </button>
      <input ref={inputRef} type="file" hidden multiple accept="image/*" onChange={(e) => addFiles(e.target.files)} />

      <div className="admin-gallery">
        {(rows || []).map((r) => (
          <figure key={r.id}>
            <Img src={r.image_url} alt={r.caption || ''} />
            <button className="admin-gallery-del" onClick={() => onDelete(r)} aria-label="Delete photo">
              <CloseIcon width={16} height={16} />
            </button>
            <input
              className="input input-sm"
              defaultValue={r.caption || ''}
              placeholder="Caption (optional)"
              onBlur={(e) => saveCaption(r, e.target.value.trim())}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </figure>
        ))}
      </div>
    </section>
  )
}
