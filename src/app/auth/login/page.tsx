'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ''

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      const dest = redirectTo || (data.isAdmin ? '/admin' : '/dashboard')
      router.push(dest)
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
        {/* Header */}
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
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
            Sign in to visit your forest
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--paper)', border: '1px solid var(--line)',
          borderRadius: 18, padding: '32px 36px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
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

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <hr className="dotted-rule" style={{ margin: '24px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)' }}>
            No account yet?{' '}
            <Link href={`/auth/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} style={{ color: 'var(--forest)', textDecoration: 'none', fontWeight: 500 }}>
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh' }} />}>
      <LoginForm />
    </Suspense>
  )
}
