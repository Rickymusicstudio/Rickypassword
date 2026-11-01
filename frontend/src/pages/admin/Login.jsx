// src/pages/admin/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { niceError, signIn } from './adminApi'
import { NotConfigured } from './Admin.jsx'
import './admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  if (!supabase) return <NotConfigured />

  async function onSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setErr('')
    setLoading(true)
    try {
      await signIn(String(form.get('email')).trim(), String(form.get('password')))
      navigate('/admin', { replace: true })
    } catch (e2) {
      setErr(/invalid login/i.test(e2.message) ? 'Wrong email or password.' : niceError(e2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-center">
      <form className="admin-card form" onSubmit={onSubmit} style={{ width: 'min(100%, 400px)' }}>
        <Link to="/" className="brand">Ricky<span>Password</span></Link>
        <h1 className="admin-title">Admin sign in</h1>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" name="email" autoComplete="username" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input className="input" type="password" name="password" autoComplete="current-password" required />
        </label>
        {err && <div className="form-status"><span className="err">{err}</span></div>}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
