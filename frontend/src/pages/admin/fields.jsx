// src/pages/admin/fields.jsx — form building blocks shared by the admin tabs
import { useRef, useState } from 'react'
import { niceError, uploadMedia } from './adminApi'
import { CloseIcon } from '../../components/Icons.jsx'

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small className="muted">{hint}</small>}
    </label>
  )
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="check">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

/** Single file upload with preview. kind: "image" | "audio". */
export function UploadField({ label, kind, folder, value, onChange, onError }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const pick = async (file) => {
    if (!file) return
    setBusy(true)
    try { onChange(await uploadMedia(file, folder)) } catch (e) { onError(niceError(e)) } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="field">
      <span>{label}</span>
      <div className={`upload ${kind}`}>
        {value && kind === 'image' && <img src={value} alt="" />}
        {value && kind === 'audio' && <audio src={encodeURI(decodeURI(value))} controls preload="none" />}
        <div className="upload-actions">
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? 'Uploading…' : value ? 'Replace' : kind === 'image' ? 'Upload image' : 'Upload MP3'}
          </button>
          {value && !busy && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>Remove</button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={kind === 'image' ? 'image/*' : 'audio/*'}
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
    </div>
  )
}

/** Several photos (news article gallery). */
export function MultiImageField({ label, folder, value = [], onChange, onError }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(0)

  const pick = async (files) => {
    const list = [...(files || [])]
    if (!list.length) return
    setBusy(list.length)
    const urls = []
    for (const f of list) {
      try { urls.push(await uploadMedia(f, folder)) } catch (e) { onError(niceError(e)) }
      setBusy((n) => n - 1)
    }
    onChange([...value, ...urls])
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="field">
      <span>{label}</span>
      <div className="thumbs">
        {value.map((url, i) => (
          <div key={url} className="thumb">
            <img src={url} alt="" />
            <button type="button" aria-label="Remove photo" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        ))}
        <button type="button" className="thumb thumb-add" disabled={busy > 0} onClick={() => inputRef.current?.click()}>
          {busy > 0 ? `Uploading ${busy}…` : '+ Add photos'}
        </button>
      </div>
      <input ref={inputRef} type="file" hidden multiple accept="image/*" onChange={(e) => pick(e.target.files)} />
    </div>
  )
}
