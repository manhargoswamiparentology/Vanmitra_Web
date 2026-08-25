'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Tree {
  id: string
  recipientName: string
  speciesId: string
}

interface Note {
  id: string
  title: string
  body: string
  mood: 'JOY' | 'REFLECTION' | 'ANTICIPATION'
  createdAt: string
  treeId: string | null
  tree?: { recipientName: string; speciesId: string } | null
}

const MOOD_LABELS: Record<string, string> = {
  JOY: 'Joy',
  REFLECTION: 'Reflection',
  ANTICIPATION: 'Anticipation',
}

const MOOD_ACCENT: Record<string, string> = {
  JOY: 'var(--gold)',
  REFLECTION: 'var(--moss)',
  ANTICIPATION: 'var(--terra)',
}

const MOOD_BG: Record<string, string> = {
  JOY: 'oklch(0.78 0.10 80 / 0.12)',
  REFLECTION: 'oklch(0.55 0.09 145 / 0.12)',
  ANTICIPATION: 'oklch(0.62 0.13 45 / 0.12)',
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [trees, setTrees] = useState<Tree[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    treeId: '',
    body: '',
    mood: 'REFLECTION' as 'JOY' | 'REFLECTION' | 'ANTICIPATION',
  })

  const fetchData = useCallback(async () => {
    try {
      const [notesRes, treesRes] = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/trees'),
      ])
      if (notesRes.ok) {
        const data = await notesRes.json()
        setNotes(data)
      }
      if (treesRes.ok) {
        const data = await treesRes.json()
        setTrees(data)
      }
    } catch {
      // silently fail, show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and body are required.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/notes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          body: form.body.trim(),
          mood: form.mood,
          treeId: form.treeId || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || 'Failed to create note.')
        return
      }
      setForm({ title: '', treeId: '', body: '', mood: 'REFLECTION' })
      setShowForm(false)
      await fetchData()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 300,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ marginBottom: 6 }}>Notes</h3>
          <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', fontSize: 15 }}>
            Thoughts about your trees, your visits, and your forest.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { setShowForm(!showForm); setError('') }}
          style={{ flexShrink: 0 }}
        >
          {showForm ? '✕ Cancel' : '+ New note'}
        </button>
      </div>

      {/* New note form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            padding: '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 4,
            }}
          >
            New note
          </div>

          {error && (
            <div
              style={{
                background: 'oklch(0.62 0.13 45 / 0.1)',
                border: '1px solid oklch(0.62 0.13 45 / 0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: 'var(--serif)',
                fontSize: 14,
                color: 'var(--terra-deep)',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field">
              <label>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="What's on your mind?"
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label>Tree (optional)</label>
              <select
                value={form.treeId}
                onChange={(e) => setForm((f) => ({ ...f, treeId: e.target.value }))}
                disabled={submitting}
              >
                <option value="">No specific tree</option>
                {trees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.recipientName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Your note</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Write freely..."
              disabled={submitting}
              style={{ minHeight: 120 }}
            />
          </div>

          <div className="field">
            <label>Mood</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['JOY', 'REFLECTION', 'ANTICIPATION'] as const).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mood }))}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: `1px solid ${form.mood === mood ? MOOD_ACCENT[mood] : 'var(--line)'}`,
                    background: form.mood === mood ? MOOD_BG[mood] : 'transparent',
                    color: form.mood === mood ? MOOD_ACCENT[mood] : 'var(--ink-mute)',
                    cursor: 'pointer',
                    transition: 'all 120ms',
                  }}
                >
                  {MOOD_LABELS[mood]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setShowForm(false); setError('') }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save note'}
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {notes.length === 0 && !showForm && (
        <div
          style={{
            border: '2px dashed var(--line)',
            borderRadius: 16,
            padding: '56px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 44 }}>📝</div>
          <div>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--ink)',
                marginBottom: 8,
              }}
            >
              No notes yet
            </div>
            <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', maxWidth: 360 }}>
              Write about your tree, a visit, or just how you feel about growing a forest.
            </p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => setShowForm(true)}
          >
            + Write your first note
          </button>
        </div>
      )}

      {/* Notes grid */}
      {notes.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {notes.map((note) => (
            <div
              key={note.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                borderTop: `3px solid ${MOOD_ACCENT[note.mood]}`,
              }}
            >
              <div style={{ padding: '16px 18px 18px' }}>
                {/* Date + tree mono */}
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-mute)',
                    marginBottom: 10,
                  }}
                >
                  {new Date(note.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {note.tree && (
                    <span style={{ color: 'var(--moss)', marginLeft: 8 }}>
                      · {note.tree.recipientName}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div
                  style={{
                    fontFamily: 'var(--display)',
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    marginBottom: 8,
                    lineHeight: 1.25,
                  }}
                >
                  {note.title}
                </div>

                {/* Body */}
                <p
                  style={{
                    fontFamily: 'var(--serif)',
                    fontStyle: 'italic',
                    fontSize: 14,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {note.body}
                </p>

                {/* Footer */}
                <div style={{ marginTop: 14 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: MOOD_BG[note.mood],
                      color: MOOD_ACCENT[note.mood],
                      border: `1px solid ${MOOD_ACCENT[note.mood]}44`,
                    }}
                  >
                    {MOOD_LABELS[note.mood]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
