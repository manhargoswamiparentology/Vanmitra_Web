'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogVisitForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [visitDate, setVisitDate]     = useState(new Date().toISOString().slice(0, 10))
  const [duration, setDuration]       = useState('')
  const [companions, setCompanions]   = useState('')
  const [note, setNote]               = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitDate, duration, companions, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }
      // Reset form and close
      setDuration('')
      setCompanions('')
      setNote('')
      setVisitDate(new Date().toISOString().slice(0, 10))
      setOpen(false)
      router.refresh()
    } catch {
      setError('Could not connect. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn btn-primary btn-sm"
        >
          + Log a visit
        </button>
      ) : (
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '24px 28px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>
              Log a visit
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--ink-mute)',
                padding: '4px 8px',
              }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="visitDate">Date of visit *</label>
                <input
                  id="visitDate"
                  type="date"
                  required
                  value={visitDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setVisitDate(e.target.value)}
                />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="duration">How long were you there?</label>
                <input
                  id="duration"
                  type="text"
                  placeholder="e.g. 2 hours, half a day"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="companions">Who came with you? (optional)</label>
              <input
                id="companions"
                type="text"
                placeholder="e.g. Came with family, solo, with Nirali"
                value={companions}
                onChange={e => setCompanions(e.target.value)}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="visitNote">
                How was it?{' '}
                <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>({note.length}/400)</span>
              </label>
              <textarea
                id="visitNote"
                placeholder="The tree has grown so much since last time…"
                value={note}
                maxLength={400}
                onChange={e => setNote(e.target.value)}
                style={{ minHeight: 90, resize: 'vertical' }}
              />
            </div>

            {error && (
              <div style={{
                background: 'color-mix(in srgb, var(--terra) 10%, var(--paper))',
                border: '1px solid color-mix(in srgb, var(--terra) 30%, var(--line))',
                borderRadius: 10,
                padding: '10px 14px',
                fontFamily: 'var(--serif)',
                fontSize: 13,
                color: 'var(--terra-deep)',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving…' : 'Save visit'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
