'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FixQrCodesButton() {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleClick() {
    setRunning(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/backfill-qr-codes', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.message)
      router.refresh()
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Failed to update QR codes')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={running}
        className="btn btn-ghost"
        style={{ flexShrink: 0, opacity: running ? 0.6 : 1 }}
      >
        {running ? 'Fixing QR codes…' : 'Fix old QR codes'}
      </button>
      {result && (
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-mute)',
            maxWidth: 240,
            textAlign: 'right',
          }}
        >
          {result}
        </span>
      )}
    </div>
  )
}
