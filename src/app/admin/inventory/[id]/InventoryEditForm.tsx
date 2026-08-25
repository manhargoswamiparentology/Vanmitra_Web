'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SPECIES = [
  { id: 'neem', name: 'Neem' },
  { id: 'mango', name: 'Mango' },
  { id: 'peepal', name: 'Peepal' },
  { id: 'banyan', name: 'Banyan' },
  { id: 'drumstick', name: 'Drumstick' },
  { id: 'gulmohar', name: 'Gulmohar' },
  { id: 'arjun', name: 'Arjun' },
]

const HEALTH_OPTIONS = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'stressed', label: 'Stressed' },
  { value: 'diseased', label: 'Diseased' },
  { value: 'deceased', label: 'Deceased' },
]

interface InventoryTreeEditProps {
  tree: {
    id: string
    status: string
    speciesId: string
    plotBlock: string | null
    plotRow: string | null
    plotPosition: string | null
    locationAddress: string | null
    gpsLat: number | null
    gpsLng: number | null
    price: number
    heightCm: number | null
    healthStatus: string | null
    notes: string | null
  }
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

export default function InventoryEditForm({ tree }: InventoryTreeEditProps) {
  const router = useRouter()

  const [currentStatus, setCurrentStatus] = useState(tree.status)
  const [statusChanging, setStatusChanging] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleStatusChange(newStatus: 'FREE' | 'DRAFT') {
    setStatusChanging(true)
    setStatusMsg(null)
    try {
      const res = await fetch(`/api/admin/inventory/${tree.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update status')
      setCurrentStatus(newStatus)
      setStatusMsg({ type: 'ok', text: newStatus === 'FREE' ? 'Tree is now live and visible to users.' : 'Tree moved back to draft — hidden from users.' })
      router.refresh()
    } catch (err) {
      setStatusMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setStatusChanging(false)
    }
  }

  const [speciesId, setSpeciesId] = useState(tree.speciesId)
  const [plotBlock, setPlotBlock] = useState(tree.plotBlock || '')
  const [plotRow, setPlotRow] = useState(tree.plotRow || '')
  const [plotPosition, setPlotPosition] = useState(tree.plotPosition || '')
  const [locationAddress, setLocationAddress] = useState(tree.locationAddress || '')
  const [gpsLat, setGpsLat] = useState(tree.gpsLat?.toString() || '')
  const [gpsLng, setGpsLng] = useState(tree.gpsLng?.toString() || '')
  const [price, setPrice] = useState(tree.price.toString())
  const [heightCm, setHeightCm] = useState(tree.heightCm?.toString() || '')
  const [healthStatus, setHealthStatus] = useState(tree.healthStatus || '')
  const [notes, setNotes] = useState(tree.notes || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)

    try {
      const res = await fetch(`/api/admin/inventory/${tree.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speciesId,
          plotBlock: plotBlock || null,
          plotRow: plotRow || null,
          plotPosition: plotPosition || null,
          locationAddress: locationAddress || null,
          gpsLat: gpsLat ? parseFloat(gpsLat) : null,
          gpsLng: gpsLng ? parseFloat(gpsLng) : null,
          price: price ? parseInt(price) : tree.price,
          heightCm: heightCm ? parseInt(heightCm) : null,
          healthStatus: healthStatus || null,
          notes: notes || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')

      setMsg({ type: 'ok', text: 'Changes saved.' })
      router.refresh()
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error saving' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>

      {/* ── Availability status control ── */}
      {(currentStatus === 'DRAFT' || currentStatus === 'FREE') && (
        <div style={{
          borderRadius: 12,
          border: currentStatus === 'DRAFT'
            ? '1.5px dashed var(--ink-mute)'
            : '1.5px solid color-mix(in oklch, var(--moss) 40%, var(--line))',
          background: currentStatus === 'DRAFT'
            ? 'var(--paper-2)'
            : 'color-mix(in oklch, var(--moss) 6%, var(--paper))',
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>
                Availability
              </div>
              {currentStatus === 'DRAFT' ? (
                <>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>
                    Draft — hidden from users
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-mute)' }}>
                    Plant the tree and assign its ID before publishing.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--forest)', marginBottom: 2 }}>
                    Live — visible &amp; available to users
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-mute)' }}>
                    Users can see and dedicate this tree.
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              {currentStatus === 'DRAFT' ? (
                <button
                  type="button"
                  onClick={() => handleStatusChange('FREE')}
                  disabled={statusChanging}
                  className="btn btn-primary"
                  style={{ opacity: statusChanging ? 0.6 : 1 }}
                >
                  {statusChanging ? 'Publishing…' : 'Publish → Make available to users'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStatusChange('DRAFT')}
                  disabled={statusChanging}
                  className="btn btn-ghost btn-sm"
                  style={{ opacity: statusChanging ? 0.6 : 1 }}
                >
                  {statusChanging ? 'Saving…' : 'Move back to Draft'}
                </button>
              )}
              {statusMsg && (
                <div style={msgStyle(statusMsg.type)}>{statusMsg.text}</div>
              )}
            </div>
          </div>
        </div>
      )}

    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
      {/* Species */}
      <div className="field">
        <label>Species</label>
        <select value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
          {SPECIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Plot */}
      <div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: 'var(--ink-mute)',
            marginBottom: 8,
          }}
        >
          Plot Location
        </div>
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
        <label>Location Address</label>
        <input
          type="text"
          placeholder="e.g. Block C, Row 4 — Vasna Village, Kheda, Gujarat"
          value={locationAddress}
          onChange={(e) => setLocationAddress(e.target.value)}
        />
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', marginTop: 5, letterSpacing: '0.05em' }}>
          Shown on tree cards and certificates.
        </p>
      </div>

      {/* GPS */}
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

      {/* Price + Height */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="field">
          <label>Price ₹</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Height cm</label>
          <input
            type="number"
            min="0"
            placeholder="—"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
        </div>
      </div>

      {/* Health status */}
      <div className="field">
        <label>Health Status</label>
        <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)}>
          <option value="">— not set —</option>
          {HEALTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="field">
        <label>Admin Notes</label>
        <textarea
          rows={3}
          placeholder="Internal notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {msg && <div style={msgStyle(msg.type)}>{msg.text}</div>}

      <div>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
    </div>
  )
}
