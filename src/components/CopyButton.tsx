'use client'

import { useState } from 'react'

export default function CopyButton({ url, label = 'Copy link' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement('textarea')
      el.value = url
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="btn btn-ghost btn-sm"
      style={{
        flexShrink: 0,
        transition: 'all 200ms',
        background: copied ? 'color-mix(in oklch, var(--moss) 15%, var(--paper))' : undefined,
        color: copied ? 'var(--forest)' : undefined,
        borderColor: copied ? 'var(--moss)' : undefined,
      }}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  )
}
