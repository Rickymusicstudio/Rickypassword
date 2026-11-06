// src/components/ShareBox.jsx — share link with copy + one-tap WhatsApp / Facebook / X / native share
import { useState } from 'react'
import { FacebookIcon, LinkIcon, ShareIcon, WhatsAppIcon, XIcon } from './Icons.jsx'

export default function ShareBox({ url, title, text }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent
  const message = text || title

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // older browsers: select the field so the user can copy it
      document.getElementById('share-url')?.select()
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const nativeShare = async () => {
    try { await navigator.share({ title, text: message, url }) } catch { /* dismissed */ }
  }

  return (
    <div className="sharebox" aria-label="Share">
      <span className="sharebox-label">Share this song</span>
      <div className="sharebox-link">
        <LinkIcon width={18} height={18} />
        <input id="share-url" readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Song link" />
        <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? 'Copied!' : 'Copy link'}</button>
      </div>
      <div className="sharebox-buttons">
        {typeof navigator !== 'undefined' && navigator.share && (
          <button className="share-btn" onClick={nativeShare}><ShareIcon width={18} height={18} /> Share</button>
        )}
        <a className="share-btn wa" href={`https://wa.me/?text=${enc(`${message} ${url}`)}`} target="_blank" rel="noreferrer">
          <WhatsAppIcon width={18} height={18} /> WhatsApp
        </a>
        <a className="share-btn fb" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noreferrer">
          <FacebookIcon width={18} height={18} /> Facebook
        </a>
        <a className="share-btn" href={`https://x.com/intent/post?text=${enc(message)}&url=${enc(url)}`} target="_blank" rel="noreferrer">
          <XIcon width={16} height={16} /> X
        </a>
      </div>
    </div>
  )
}
