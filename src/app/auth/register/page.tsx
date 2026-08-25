'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ''

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [isCorporate, setIsCorporate] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (isCorporate && !companyName.trim()) {
      setError('Please enter your company name')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, isCorporate, companyName }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(redirectTo || '/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '80vh', display: 'grid', placeItems: 'center',
      background: 'var(--paper)', padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" style={{ color: 'var(--forest)' }}>
              <ellipse cx="18" cy="18" rx="7" ry="9" fill="currentColor" opacity="0.7" />
              <ellipse cx="13" cy="16" rx="5" ry="6" fill="currentColor" opacity="0.5" />
              <ellipse cx="23" cy="16" rx="5" ry="6" fill="currentColor" opacity="0.5" />
              <rect x="17" y="22" width="2" height="8" fill="currentColor" opacity="0.6" />
            </svg>
            <span style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 500 }}>
              Van<em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--moss)' }}>amitra</em>
            </span>
          </div>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>Plant your first tree</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
            Create an account to start your forest
          </p>
        </div>

        <div style={{
          background: 'var(--paper)', border: '1px solid var(--line)',
          borderRadius: 18, padding: '32px 36px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input
                id="name" type="text" required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Aarti Patel"
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Corporate toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 10,
              border: isCorporate ? '1.5px solid var(--forest)' : '1px solid var(--line)',
              background: isCorporate ? 'color-mix(in oklch, var(--forest) 6%, var(--paper))' : 'var(--paper)',
              cursor: 'pointer',
              transition: 'all 160ms',
            }} onClick={() => setIsCorporate(v => !v)}>
              <div style={{
                width: 36, height: 20, borderRadius: 999,
                background: isCorporate ? 'var(--forest)' : 'var(--line)',
                position: 'relative', flexShrink: 0, transition: 'background 160ms',
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: isCorporate ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'white', transition: 'left 160ms',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                  Registering as a company / HR
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.04em' }}>
                  For CSR, gifting trees to employees, or bulk dedications
                </div>
              </div>
            </div>

            {isCorporate && (
              <div className="field">
                <label htmlFor="companyName">Company name</label>
                <input
                  id="companyName" type="text" required={isCorporate}
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Microsoft India Pvt. Ltd."
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword" type="password" required
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'color-mix(in oklch, var(--terra) 10%, var(--paper))',
                border: '1px solid color-mix(in oklch, var(--terra) 30%, var(--line))',
                borderRadius: 10, padding: '12px 16px',
                fontSize: 14, color: 'var(--terra-deep)',
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--ink-mute)', textAlign: 'center', lineHeight: 1.5 }}>
              By creating an account you agree to receive monthly tree updates via email.
            </p>
          </form>

          <hr className="dotted-rule" style={{ margin: '24px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)' }}>
            Already have an account?{' '}
            <Link href={`/auth/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} style={{ color: 'var(--forest)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh' }} />}>
      <RegisterForm />
    </Suspense>
  )
}
