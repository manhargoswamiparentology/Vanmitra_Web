'use client'

import { useState } from 'react'

type FormState = {
  company: string
  contact: string
  email: string
  phone: string
  trees: string
  message: string
}

const TREE_OPTIONS = [
  '100 trees',
  '250 trees',
  '500 trees',
  '1,000 trees',
  '2,000+ trees',
  'Custom / discuss',
]

export default function CSRForm() {
  const [form, setForm] = useState<FormState>({
    company: '',
    contact: '',
    email: '',
    phone: '',
    trees: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function update(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/csr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '56px 40px',
        background: 'color-mix(in oklch, var(--moss) 10%, var(--paper))',
        border: '1px solid color-mix(in oklch, var(--moss) 30%, var(--line))',
        borderRadius: 20,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'color-mix(in oklch, var(--moss) 20%, var(--paper))',
          border: '2px solid var(--moss)',
          color: 'var(--moss)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 28,
          margin: '0 auto 20px',
        }}>
          ✓
        </div>
        <h3 style={{ marginBottom: 12, color: 'var(--forest)' }}>
          We've got your enquiry.
        </h3>
        <p style={{
          fontFamily: 'var(--serif)',
          fontSize: 17,
          color: 'var(--ink-soft)',
          lineHeight: 1.65,
          maxWidth: 440,
          margin: '0 auto',
        }}>
          Expect a response from our CSR team within one business day. We look forward to planting
          a forest with you.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field">
          <label htmlFor="company">Company name *</label>
          <input
            id="company"
            type="text"
            required
            placeholder="e.g. Tata Chemicals Ltd"
            value={form.company}
            onChange={e => update('company', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="contact">Contact name *</label>
          <input
            id="contact"
            type="text"
            required
            placeholder="Your full name"
            value={form.contact}
            onChange={e => update('contact', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field">
          <label htmlFor="email">Work email *</label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={e => update('email', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="trees">Number of trees needed</label>
        <select
          id="trees"
          value={form.trees}
          onChange={e => update('trees', e.target.value)}
        >
          <option value="">Select a range…</option>
          {TREE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="message">Tell us about your initiative (optional)</label>
        <textarea
          id="message"
          placeholder="Timeline, team size, reporting requirements, any specific species or occasion…"
          value={form.message}
          onChange={e => update('message', e.target.value)}
          style={{ minHeight: 110 }}
        />
      </div>

      {error && (
        <div style={{
          background: 'color-mix(in oklch, var(--terra) 10%, var(--paper))',
          border: '1px solid color-mix(in oklch, var(--terra) 30%, var(--line))',
          borderRadius: 10,
          padding: '12px 16px',
          fontSize: 14,
          color: 'var(--terra-deep)',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ justifyContent: 'center' }}
      >
        {loading ? 'Sending…' : 'Send enquiry →'}
      </button>

      <p style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ink-mute)',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        We respond within 1 business day · No spam, ever
      </p>
    </form>
  )
}
