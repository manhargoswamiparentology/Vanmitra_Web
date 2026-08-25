'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SPECIES = [
  { id: 'neem', name: 'Neem' },
  { id: 'mango', name: 'Mango' },
  { id: 'peepal', name: 'Peepal' },
  { id: 'banyan', name: 'Banyan' },
  { id: 'drumstick', name: 'Drumstick' },
  { id: 'gulmohar', name: 'Gulmohar' },
  { id: 'arjun', name: 'Arjun' },
]

interface SuccessResult {
  uniqueId: string
  id: string
}

function msgStyle(type: 'ok' | 'err'): React.CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'var(--display)',
    background:
      type === 'ok'
        ? 'color-mix(in oklch, var(--moss) 12%, var(--paper))'
        : 'color-mix(in oklch, var(--terra) 12%, var(--paper))',
    color: type === 'ok' ? 'var(--forest)' : 'var(--terra-deep)',
    border: `1px solid ${
      type === 'ok'
        ? 'color-mix(in oklch, var(--moss) 30%, transparent)'
        : 'color-mix(in oklch, var(--terra) 30%, transparent)'
    }`,
  }
}

function sectionLabel(text: string) {
  return (
    <div
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: 'var(--ink-mute)',
        marginBottom: 4,
      }}
    >
      {text}
    </div>
  )
}

export default function NewInventoryTreePage() {
  const router = useRouter()

  // Single tree form state
  const [speciesId, setSpeciesId] = useState(SPECIES[0].id)
  const [plotBlock, setPlotBlock] = useState('')
  const [plotRow, setPlotRow] = useState('')
  const [plotPosition, setPlotPosition] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [gpsLat, setGpsLat] = useState('')
  const [gpsLng, setGpsLng] = useState('')
  const [price, setPrice] = useState('500')
  const [heightCm, setHeightCm] = useState('')
  const [notes, setNotes] = useState('')
  const [adding, setAdding] = useState(false)
  const [singleResult, setSingleResult] = useState<SuccessResult | null>(null)
  const [singleError, setSingleError] = useState<string | null>(null)

  // Bulk form state
  const [bulkCount, setBulkCount] = useState('5')
  const [bulkSpeciesId, setBulkSpeciesId] = useState(SPECIES[0].id)
  const [bulkBlock, setBulkBlock] = useState('')
  const [bulkStartRow, setBulkStartRow] = useState('1')
  const [bulkPrice, setBulkPrice] = useState('500')
  const [bulkAdding, setBulkAdding] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null)
  const [bulkResults, setBulkResults] = useState<SuccessResult[]>([])
  const [bulkError, setBulkError] = useState<string | null>(null)

  async function handleAddSingle(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setSingleResult(null)
    setSingleError(null)

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speciesId,
          plotBlock: plotBlock || null,
          plotRow: plotRow || null,
          plotPosition: plotPosition || null,
          locationAddress: locationAddress || null,
          gpsLat: gpsLat ? parseFloat(gpsLat) : null,
          gpsLng: gpsLng ? parseFloat(gpsLng) : null,
          price: price ? parseInt(price) : 500,
          heightCm: heightCm ? parseInt(heightCm) : null,
          notes: notes || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add tree')

      setSingleResult({ uniqueId: data.tree.uniqueId, id: data.tree.id })
      router.refresh()
    } catch (err) {
      setSingleError(err instanceof Error ? err.message : 'Error adding tree')
    } finally {
      setAdding(false)
    }
  }

  async function handleBulkAdd(e: React.FormEvent) {
    e.preventDefault()
    const total = Math.min(Math.max(parseInt(bulkCount) || 1, 1), 50)
    setBulkAdding(true)
    setBulkProgress({ done: 0, total })
    setBulkResults([])
    setBulkError(null)

    const results: SuccessResult[] = []
    const startRow = parseInt(bulkStartRow) || 1

    for (let i = 0; i < total; i++) {
      try {
        const res = await fetch('/api/admin/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            speciesId: bulkSpeciesId,
            plotBlock: bulkBlock || null,
            plotRow: String(startRow + i),
            plotPosition: null,
            price: bulkPrice ? parseInt(bulkPrice) : 500,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Failed at tree ${i + 1}`)

        results.push({ uniqueId: data.tree.uniqueId, id: data.tree.id })
        setBulkProgress({ done: i + 1, total })
        setBulkResults([...results])
      } catch (err) {
        setBulkError(
          `Stopped at tree ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
        break
      }
    }

    setBulkAdding(false)
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 28,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
        }}
      >
        <Link href="/admin/inventory" style={{ color: 'var(--forest)', textDecoration: 'none' }}>
          Inventory
        </Link>
        <span>/</span>
        <span>Add Tree</span>
      </div>

      <div className="eyebrow" style={{ marginBottom: 10 }}>Admin / Inventory</div>
      <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 28 }}>Add Tree to Inventory</h2>

      {/* Single tree form */}
      <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            marginBottom: 24,
            paddingBottom: 12,
            borderBottom: '1px solid var(--line)',
          }}
        >
          Single Tree
        </div>

        {/* Success card */}
        {singleResult && (
          <div
            style={{
              ...msgStyle('ok'),
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Tree added successfully</div>
              <span
                className="mono"
                style={{ fontSize: 13, color: 'var(--forest-deep)' }}
              >
                {singleResult.uniqueId}
              </span>
            </div>
            <Link
              href={`/admin/inventory/${singleResult.id}`}
              style={{
                fontFamily: 'var(--display)',
                fontSize: 13,
                color: 'var(--forest)',
                textDecoration: 'none',
                fontWeight: 500,
                flexShrink: 0,
                marginLeft: 16,
              }}
            >
              View tree →
            </Link>
          </div>
        )}

        {singleError && (
          <div style={{ ...msgStyle('err'), marginBottom: 20 }}>{singleError}</div>
        )}

        <form onSubmit={handleAddSingle} style={{ display: 'grid', gap: 18 }}>
          {/* Species */}
          <div className="field">
            <label>Species</label>
            <select value={speciesId} onChange={(e) => setSpeciesId(e.target.value)} required>
              {SPECIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Plot row */}
          <div>
            {sectionLabel('Plot Location')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div className="field">
                <label>Block</label>
                <input
                  type="text"
                  placeholder="A"
                  value={plotBlock}
                  onChange={(e) => setPlotBlock(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Row</label>
                <input
                  type="text"
                  placeholder="1"
                  value={plotRow}
                  onChange={(e) => setPlotRow(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Position</label>
                <input
                  type="text"
                  placeholder="1"
                  value={plotPosition}
                  onChange={(e) => setPlotPosition(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location address */}
          <div className="field">
            <label>Location Address (optional)</label>
            <input
              type="text"
              placeholder="e.g. Block C, Row 4 — Vasna Village, Kheda, Gujarat"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
            />
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', marginTop: 5, letterSpacing: '0.05em' }}>
              Shown to users on tree cards and certificates.
            </p>
          </div>

          {/* GPS */}
          <div>
            {sectionLabel('GPS Coordinates (optional)')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field">
                <label>GPS Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="12.9716"
                  value={gpsLat}
                  onChange={(e) => setGpsLat(e.target.value)}
                />
              </div>
              <div className="field">
                <label>GPS Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="77.5946"
                  value={gpsLng}
                  onChange={(e) => setGpsLng(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Price + Height */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label>Price ₹</label>
              <input
                type="number"
                min="0"
                placeholder="500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Height cm (optional)</label>
              <input
                type="number"
                min="0"
                placeholder="—"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="field">
            <label>Admin Notes (optional)</label>
            <textarea
              placeholder="Any notes about this tree for internal reference…"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={adding}
              style={{ opacity: adding ? 0.6 : 1 }}
            >
              {adding ? 'Adding…' : 'Add Tree'}
            </button>
          </div>
        </form>
      </div>

      {/* Dotted divider */}
      <hr className="dotted-rule" style={{ margin: '32px 0' }} />

      {/* Bulk add section */}
      <div className="card" style={{ padding: '28px' }}>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            marginBottom: 6,
            paddingBottom: 12,
            borderBottom: '1px solid var(--line)',
          }}
        >
          Bulk Add
        </div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 24 }}>
          Add multiple trees at once. All trees share the same block; rows auto-increment from the
          starting row.
        </p>

        {/* Bulk progress / results */}
        {bulkProgress && (
          <div style={{ ...msgStyle('ok'), marginBottom: 20 }}>
            {bulkAdding
              ? `Adding… ${bulkProgress.done} of ${bulkProgress.total}`
              : `Done — added ${bulkProgress.done} of ${bulkProgress.total} trees`}
            {bulkResults.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {bulkResults.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/inventory/${r.id}`}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      color: 'var(--forest)',
                      background: 'color-mix(in oklch, var(--forest) 8%, var(--paper))',
                      padding: '3px 8px',
                      borderRadius: 6,
                      textDecoration: 'none',
                      border: '1px solid color-mix(in oklch, var(--forest) 20%, transparent)',
                    }}
                  >
                    {r.uniqueId}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {bulkError && (
          <div style={{ ...msgStyle('err'), marginBottom: 20 }}>{bulkError}</div>
        )}

        <form onSubmit={handleBulkAdd} style={{ display: 'grid', gap: 18 }}>
          {/* Count + Species */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div className="field">
              <label>Count (1–50)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Species</label>
              <select
                value={bulkSpeciesId}
                onChange={(e) => setBulkSpeciesId(e.target.value)}
              >
                {SPECIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Block + Starting row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div className="field">
              <label>Plot Block</label>
              <input
                type="text"
                placeholder="A"
                value={bulkBlock}
                onChange={(e) => setBulkBlock(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Starting Row</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={bulkStartRow}
                onChange={(e) => setBulkStartRow(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Price ₹</label>
              <input
                type="number"
                min="0"
                placeholder="500"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-terra"
              disabled={bulkAdding}
              style={{ opacity: bulkAdding ? 0.6 : 1 }}
            >
              {bulkAdding
                ? `Adding ${bulkProgress?.done ?? 0} of ${bulkProgress?.total ?? bulkCount}…`
                : `Add ${bulkCount || '—'} Trees`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
