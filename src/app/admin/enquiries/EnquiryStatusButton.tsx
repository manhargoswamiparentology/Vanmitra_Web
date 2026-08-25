'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['new', 'read', 'replied'] as const
type Status = typeof STATUSES[number]

const STATUS_STYLE: Record<Status, { bg: string; color: string; label: string }> = {
  new:     { bg: 'color-mix(in oklch, var(--terra) 12%, var(--paper))',  color: 'var(--terra-deep)', label: 'New' },
  read:    { bg: 'color-mix(in oklch, var(--gold) 12%, var(--paper))',   color: '#8a6000',           label: 'Read' },
  replied: { bg: 'color-mix(in oklch, var(--moss) 12%, var(--paper))',   color: 'var(--forest)',     label: 'Replied' },
}

export default function EnquiryStatusButton({ id, initial }: { id: string; initial: Status }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(initial)
  const [loading, setLoading] = useState(false)

  async function cycle() {
    const next = STATUSES[(STATUSES.indexOf(status) + 1) % STATUSES.length]
    setLoading(true)
    try {
      await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next }),
      })
      setStatus(next)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const s = STATUS_STYLE[status]

  return (
    <button
      onClick={cycle}
      disabled={loading}
      title="Click to cycle status"
      style={{
        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
        background: s.bg, color: s.color,
        border: `1px solid ${s.color}44`,
        padding: '4px 10px', borderRadius: 999, fontWeight: 600,
        cursor: 'pointer', opacity: loading ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? '…' : s.label}
    </button>
  )
}
