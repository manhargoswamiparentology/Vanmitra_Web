'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [name, setName]   = useState('')
  const [note, setNote]   = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'exists' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, note }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }

      setStatus(data.alreadyExists ? 'exists' : 'done')
    } catch {
      setErrorMsg('Could not connect. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'done' || status === 'exists') {
    return (
      <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', background: 'var(--paper)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'color-mix(in oklch, var(--moss) 20%, var(--paper))',
            border: '2px solid var(--moss)',
            color: 'var(--moss)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 32,
            margin: '0 auto 24px',
          }}>
            {status === 'exists' ? '✓' : '🌱'}
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', marginBottom: 16, lineHeight: 1.1 }}>
            {status === 'exists' ? 'You\'re already on the list.' : 'You\'re on the list.'}
          </h1>

          <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 32 }}>
            {status === 'exists'
              ? `${email} is already registered. We'll notify you the moment trees are available.`
              : `We'll notify ${email} the moment new trees are available to dedicate. Until then, the farm keeps growing.`}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link href="/plant" className="btn btn-ghost">
              Check availability →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '80vh', background: 'var(--paper)', padding: '60px 0 100px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>

        {/* Back */}
        <Link href="/plant" className="btn btn-ghost btn-sm" style={{ marginBottom: 40, display: 'inline-flex' }}>
          ← Back to trees
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Sold out</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', marginBottom: 16, lineHeight: 1.1 }}>
            Join the waitlist.
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
            We're currently out of available trees. New saplings are added every month.
            Leave your email and you'll be the first to know.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          <div className="field">
            <label htmlFor="email">Your email *</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="name">Your name (optional)</label>
            <input
              id="name"
              type="text"
              placeholder="Amrit, Nirali…"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="note">Anything specific? (optional)</label>
            <input
              id="note"
              type="text"
              placeholder="e.g. Looking for a Mango tree for my mother"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {status === 'error' && (
            <div style={{
              background: 'color-mix(in srgb, var(--terra) 10%, var(--paper))',
              border: '1px solid color-mix(in srgb, var(--terra) 30%, var(--line))',
              borderRadius: 10,
              padding: '12px 16px',
              fontFamily: 'var(--serif)',
              fontSize: 14,
              color: 'var(--terra-deep)',
            }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={status === 'loading'}
            style={{ opacity: status === 'loading' ? 0.6 : 1 }}
          >
            {status === 'loading' ? 'Joining…' : 'Notify me when trees are available →'}
          </button>
        </form>

        {/* Trust note */}
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--ink-mute)',
          letterSpacing: '0.06em',
          marginTop: 20,
          textAlign: 'center',
        }}>
          No spam. One email when trees are available, that's it.
        </p>
      </div>
    </div>
  )
}
