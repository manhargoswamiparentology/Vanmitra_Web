'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// ─── Static data ──────────────────────────────────────────────────────────────

const OCCASIONS = [
  { id: 'mother',      title: 'For Mother',             accent: '#C77B5C' },
  { id: 'memory',      title: 'In Memory',              accent: '#7E8C5B' },
  { id: 'special',     title: 'For Someone Special',    accent: '#D4994A' },
  { id: 'newborn',     title: 'For a Newborn',          accent: '#A2B57E' },
  { id: 'anniversary', title: 'For Anniversary',        accent: '#B86A4F' },
  { id: 'festival',    title: 'For Festivals',          accent: '#D9A24E' },
  { id: 'corporate',   title: 'CSR & Corporate',        accent: '#5C7A52' },
  { id: 'self',        title: 'For Yourself',           accent: '#8C6F4B' },
]

const SPECIES = [
  { id: 'neem',       name: 'Neem',       symbolism: 'Healing, protection'  },
  { id: 'mango',      name: 'Mango',      symbolism: 'Abundance, love'       },
  { id: 'peepal',     name: 'Peepal',     symbolism: 'Wisdom, longevity'     },
  { id: 'banyan',     name: 'Banyan',     symbolism: 'Memory, gathering'     },
  { id: 'drumstick',  name: 'Drumstick',  symbolism: 'Nourishment, strength' },
  { id: 'gulmohar',   name: 'Gulmohar',   symbolism: 'Joy, summer fire'      },
  { id: 'arjun',      name: 'Arjun',      symbolism: 'Strength of heart'     },
]

const STEP_LABELS = ['Occasion', 'Recipients', 'Tree', 'Message', 'Review']

const PREWRITTEN_MESSAGES = [
  'Maa, every month a photo will arrive.',
  'For all the years you were there.',
  'Let this grow as you sleep.',
]

const MAX_RECIPIENTS = 10

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recipient {
  id: string
  name: string
  phone: string
  email: string
  speciesId: string
}

interface InventoryTreeOption {
  id: string
  uniqueId: string
  speciesId: string
  speciesName: string
  plotBlock?: string
  plotRow?: string
  plotPos?: string
  locationAddress?: string
  price: number
  healthStatus: string
  heightCm?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function makeRecipient(): Recipient {
  return { id: crypto.randomUUID(), name: '', phone: '', email: '', speciesId: '' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 14,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      background: 'var(--paper)',
    }}>
      {[80, 60, 50, 40].map((w, i) => (
        <div key={i} style={{
          height: 12,
          width: `${w}%`,
          borderRadius: 6,
          background: 'var(--paper-3)',
          animation: 'pulse 1.4s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

// ─── Main wizard inner (uses useSearchParams) ─────────────────────────────────

function PlantWizardInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ── Wizard state ──────────────────────────────────────────────────────────
  const [step,            setStep]            = useState(0)
  const [occasionId,      setOccasionId]      = useState(searchParams.get('occasion') || '')

  // Multi-recipient state
  const [isMulti,         setIsMulti]         = useState(false)
  const [recipients,      setRecipients]      = useState<Recipient[]>([makeRecipient()])
  // Single-recipient shim (used when isMulti=false — points to recipients[0])
  const recipientName = recipients[0]?.name ?? ''
  const recipientFrom = '' // kept for backwards compat on review card
  const employeeEmail = recipients[0]?.email ?? ''
  const employeePhone = recipients[0]?.phone ?? ''

  // Shared message (applies to all dedications)
  const [message,         setMessage]         = useState('')

  // Single-tree mode (isMulti=false)
  const [selectedTreeId,  setSelectedTreeId]  = useState<string | null>(null)
  const [availableTrees,  setAvailableTrees]  = useState<InventoryTreeOption[]>([])
  const [loadingTrees,    setLoadingTrees]    = useState(false)

  // Multi-tree mode: pick one species for all
  const [multiSpeciesId,  setMultiSpeciesId]  = useState('')

  // Species availability counts for multi mode dropdowns
  const [speciesCounts,   setSpeciesCounts]   = useState<Record<string, number>>({})
  const [loadingCounts,   setLoadingCounts]   = useState(false)
  const [countsReady,     setCountsReady]     = useState(false)

  const [reservedUntil,   setReservedUntil]   = useState<Date | null>(null)
  const [reserving,       setReserving]       = useState(false)
  const [confirming,      setConfirming]      = useState(false)
  const [error,           setError]           = useState<React.ReactNode>('')

  // ── Auth state ────────────────────────────────────────────────────────────
  const [isLoggedIn,      setIsLoggedIn]      = useState<boolean | null>(null)
  const [isCorporate,     setIsCorporate]     = useState(false)
  const [companyName,     setCompanyName]     = useState('')

  // ── Countdown timer state ─────────────────────────────────────────────────
  const [countdownMs,     setCountdownMs]     = useState(0)
  const [timerExpired,    setTimerExpired]    = useState(false)

  // ── Species filter (single mode) ──────────────────────────────────────────
  const [filterSpeciesId, setFilterSpeciesId] = useState('')

  // refs
  const reservationRef = useRef<string | null>(null)
  const restoredRef    = useRef(false)

  // ── Derived ───────────────────────────────────────────────────────────────
  const occasion     = OCCASIONS.find(o => o.id === occasionId)
  const selectedTree = availableTrees.find(t => t.id === selectedTreeId)
  const validRecipients = recipients.filter(r => r.name.trim() && r.email.trim() && r.phone.trim() && (!isMulti || r.speciesId))
  const treeCount    = isMulti ? validRecipients.length : 1
  const totalPrice   = treeCount * 500

  // ── Restore wizard state from sessionStorage on first mount ──────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('plant_wizard')
      if (saved) {
        const s = JSON.parse(saved)
        if (s.occasionId)              setOccasionId(s.occasionId)
        if (s.message)                 setMessage(s.message)
        if (s.selectedTreeId)          setSelectedTreeId(s.selectedTreeId)
        if (typeof s.step === 'number') setStep(s.step)
        if (typeof s.isMulti === 'boolean') setIsMulti(s.isMulti)
        if (Array.isArray(s.recipients) && s.recipients.length > 0) setRecipients(s.recipients)
        if (s.multiSpeciesId)          setMultiSpeciesId(s.multiSpeciesId)
      }
    } catch {}
    restoredRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Persist wizard state ──────────────────────────────────────────────────
  useEffect(() => {
    if (!restoredRef.current) return
    try {
      sessionStorage.setItem('plant_wizard', JSON.stringify({
        step, occasionId, message, selectedTreeId,
        isMulti, recipients, multiSpeciesId,
      }))
    } catch {}
  }, [step, occasionId, message, selectedTreeId, isMulti, recipients, multiSpeciesId])

  // ── Fetch species availability counts (multi mode) ───────────────────────
  async function fetchSpeciesCounts() {
    setLoadingCounts(true)
    setCountsReady(false)
    try {
      const res = await fetch('/api/inventory/available')
      if (!res.ok) return
      const data = await res.json()
      const raw: any[] = data.trees ?? data ?? []
      const counts: Record<string, number> = {}
      for (const t of raw) {
        if (t.speciesId) counts[t.speciesId] = (counts[t.speciesId] ?? 0) + 1
      }
      setSpeciesCounts(counts)
      setCountsReady(true)
      // Clear any recipient species selection that's now at 0 stock
      setRecipients(prev => prev.map(r => {
        if (r.speciesId && (counts[r.speciesId] ?? 0) === 0) {
          return { ...r, speciesId: '' }
        }
        return r
      }))
    } catch {}
    finally {
      setLoadingCounts(false)
    }
  }

  // ── Auth check on step 4 ──────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 4) return
    setIsLoggedIn(null)
    fetch('/api/user/me')
      .then(async r => {
        setIsLoggedIn(r.ok)
        if (r.ok) {
          const u = await r.json()
          setIsCorporate(!!u.isCorporate)
          setCompanyName(u.companyName || '')
        }
      })
      .catch(() => setIsLoggedIn(false))
  }, [step])

  // ── Fetch counts when multi mode is active on step 1 ────────────────────
  useEffect(() => {
    if (isMulti && step === 1) fetchSpeciesCounts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMulti, step])

  // ── Fetch trees (single mode) ─────────────────────────────────────────────
  useEffect(() => {
    if (!isMulti) {
      if (step === 2) fetchTrees(filterSpeciesId)
      else if (step === 4 && selectedTreeId && availableTrees.length === 0) fetchTrees('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, filterSpeciesId, isMulti])

  async function fetchTrees(sId: string) {
    setLoadingTrees(true)
    setError('')
    try {
      const qs = sId ? `?species=${sId}` : ''
      const res = await fetch(`/api/inventory/available${qs}`)
      if (res.ok) {
        const data = await res.json()
        const raw: any[] = data.trees ?? data ?? []
        const mapped: InventoryTreeOption[] = raw.map(t => ({
          ...t,
          speciesName: SPECIES.find(s => s.id === t.speciesId)?.name ?? t.speciesId,
          plotPos: t.plotPosition ?? t.plotPos,
          locationAddress: t.locationAddress ?? null,
        }))
        setAvailableTrees(mapped)
      } else {
        setAvailableTrees([])
      }
    } catch {
      setAvailableTrees([])
    } finally {
      setLoadingTrees(false)
    }
  }

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!reservedUntil) return
    const tick = setInterval(() => {
      const remaining = reservedUntil.getTime() - Date.now()
      if (remaining <= 0) {
        clearInterval(tick)
        setCountdownMs(0)
        setTimerExpired(true)
        setSelectedTreeId(null)
        setReservedUntil(null)
        reservationRef.current = null
      } else {
        setCountdownMs(remaining)
        setTimerExpired(false)
      }
    }, 1000)
    setCountdownMs(Math.max(0, reservedUntil.getTime() - Date.now()))
    return () => clearInterval(tick)
  }, [reservedUntil])

  // ── Release reservation on unmount ────────────────────────────────────────
  useEffect(() => {
    const release = () => {
      if (reservationRef.current) {
        navigator.sendBeacon('/api/inventory/reserve', JSON.stringify({ treeId: reservationRef.current, _method: 'DELETE' }))
      }
    }
    window.addEventListener('beforeunload', release)
    return () => {
      window.removeEventListener('beforeunload', release)
      if (reservationRef.current) {
        fetch('/api/inventory/reserve', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ treeId: reservationRef.current }),
          keepalive: true,
        }).catch(() => {})
        reservationRef.current = null
      }
    }
  }, [])

  // ── Can continue? ─────────────────────────────────────────────────────────
  function canContinue(): boolean {
    if (step === 0) return !!occasionId
    if (step === 1) {
      if (isMulti) return validRecipients.length >= 1
      return !!recipients[0]?.name.trim()
    }
    if (step === 2) {
      // multi: step 2 is a review of the list — always passable if recipients are valid
      if (isMulti) return validRecipients.length >= 1
      return !!selectedTreeId
    }
    return true
  }

  // ── Recipient helpers ─────────────────────────────────────────────────────
  function updateRecipient(id: string, field: keyof Recipient, value: string) {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  function addRecipient() {
    if (recipients.length < MAX_RECIPIENTS) {
      setRecipients(prev => [...prev, makeRecipient()])
    }
  }

  function removeRecipient(id: string) {
    if (recipients.length > 1) {
      setRecipients(prev => prev.filter(r => r.id !== id))
    }
  }

  // ── Reserve (single mode) ─────────────────────────────────────────────────
  async function handleReserve() {
    if (!selectedTreeId) return
    setReserving(true)
    setError('')
    try {
      const res = await fetch('/api/inventory/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treeId: selectedTreeId }),
      })
      if (res.status === 409) {
        setError('This tree was just taken. Please pick another.')
        setSelectedTreeId(null)
        setStep(2)
        return
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Reservation failed. Please try again.')
        return
      }
      const data = await res.json()
      reservationRef.current = selectedTreeId
      setReservedUntil(new Date(data.reservedUntil ?? Date.now() + 5 * 60 * 1000))
    } finally {
      setReserving(false)
    }
  }

  async function handleRelease() {
    if (!reservationRef.current) return
    await fetch('/api/inventory/reserve', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ treeId: reservationRef.current }),
    }).catch(() => {})
    reservationRef.current = null
    setSelectedTreeId(null)
    setReservedUntil(null)
    setCountdownMs(0)
  }

  // ── Confirm — single tree ─────────────────────────────────────────────────
  async function handleConfirmSingle() {
    if (!selectedTreeId) return
    setConfirming(true)
    setError('')
    try {
      const res = await fetch('/api/inventory/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treeId: selectedTreeId,
          occasionId,
          recipientName: recipients[0]?.name ?? '',
          recipientFrom: '',
          message,
          employeeEmail: recipients[0]?.email || undefined,
          employeePhone: recipients[0]?.phone || undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Something went wrong. Please try again.')
        return
      }
      const data = await res.json()
      reservationRef.current = null
      try { sessionStorage.removeItem('plant_wizard') } catch {}
      router.push(`/dedications/${data.dedicationId ?? data.id}`)
    } finally {
      setConfirming(false)
    }
  }

  // ── Confirm — multi tree (per-recipient species, sequential) ─────────────
  async function handleConfirmMulti() {
    if (validRecipients.length === 0) return
    setConfirming(true)
    setError('')
    try {
      // Group recipients by species so we fetch inventory once per species
      const bySpecies = new Map<string, Recipient[]>()
      for (const r of validRecipients) {
        if (!bySpecies.has(r.speciesId)) bySpecies.set(r.speciesId, [])
        bySpecies.get(r.speciesId)!.push(r)
      }

      // Pre-check that enough trees exist for each species
      const speciesTrees = new Map<string, InventoryTreeOption[]>()
      for (const [spId, recs] of bySpecies) {
        const res = await fetch(`/api/inventory/available?species=${spId}`)
        if (!res.ok) { setError('Could not fetch available trees. Please try again.'); return }
        const data = await res.json()
        const trees: InventoryTreeOption[] = (data.trees ?? data ?? []).map((t: any) => ({
          ...t,
          speciesName: SPECIES.find(s => s.id === t.speciesId)?.name ?? t.speciesId,
        }))
        if (trees.length < recs.length) {
          const name = SPECIES.find(s => s.id === spId)?.name ?? spId
          if (trees.length === 0) {
            setError(
              <span>
                <strong>{name}</strong> trees are currently sold out.{' '}
                <Link href="/waitlist" style={{ color: 'var(--terra-deep)', textDecoration: 'underline' }}>
                  Join the waitlist →
                </Link>
                {' '}or go back and change the species for those recipients.
              </span>
            )
          } else {
            setError(
              <span>
                Only <strong>{trees.length} {name} {trees.length === 1 ? 'tree' : 'trees'}</strong> available but you need {recs.length}.{' '}
                Please go back and remove {recs.length - trees.length} recipient{recs.length - trees.length > 1 ? 's' : ''} for this species, or choose a different species.
              </span>
            )
          }
          return
        }
        speciesTrees.set(spId, trees)
      }

      // Assign one tree per recipient and confirm
      const usedTreeIds = new Set<string>()
      const dedicationIds: string[] = []

      for (const recipient of validRecipients) {
        const trees = speciesTrees.get(recipient.speciesId)!
        const tree = trees.find(t => !usedTreeIds.has(t.id))
        if (!tree) {
          const name = SPECIES.find(s => s.id === recipient.speciesId)?.name ?? 'that species'
          setError(
            <span>
              Ran out of <strong>{name}</strong> trees. Another buyer may have just taken one.{' '}
              Please go back and adjust your selection, or{' '}
              <Link href="/waitlist" style={{ color: 'var(--terra-deep)', textDecoration: 'underline' }}>join the waitlist</Link>.
            </span>
          )
          return
        }
        usedTreeIds.add(tree.id)

        const confirmRes = await fetch('/api/inventory/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            treeId: tree.id,
            occasionId,
            recipientName: recipient.name,
            recipientFrom: '',
            message,
            employeeEmail: recipient.email || undefined,
            employeePhone: recipient.phone || undefined,
          }),
        })
        if (!confirmRes.ok) {
          const d = await confirmRes.json().catch(() => ({}))
          setError(`Failed for ${recipient.name}: ${d.error || 'Unknown error'}`)
          return
        }
        const d = await confirmRes.json()
        dedicationIds.push(d.dedicationId ?? d.id)
      }

      try { sessionStorage.removeItem('plant_wizard') } catch {}
      router.push(`/dedications/${dedicationIds[0]}?gifted=${dedicationIds.length}`)
    } finally {
      setConfirming(false)
    }
  }

  async function fillMyDetails() {
    try {
      const r = await fetch('/api/user/me')
      if (!r.ok) return
      const u = await r.json()
      if (u.email) {
        setRecipients(prev => prev.map((rec, i) => i === 0 ? { ...rec, email: u.email } : rec))
      }
    } catch {}
  }

  function goBack() {
    if (step > 0) setStep(s => s - 1)
  }

  function goNext() {
    if (step < 4) setStep(s => s + 1)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '80vh', padding: '40px 0 100px', background: 'var(--paper)' }}>

      {/* ── Countdown pill (fixed top-right) ── */}
      {reservedUntil && !timerExpired && (
        <div style={{
          position: 'fixed', top: 80, right: 20, zIndex: 100,
          background: 'var(--terra)', color: 'var(--paper)',
          borderRadius: 999, padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'var(--mono)', fontSize: 13,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        }}>
          <span>⏱</span>
          <span>Tree reserved: {formatCountdown(countdownMs)} remaining</span>
          <button
            onClick={handleRelease}
            style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.05em',
              background: 'rgba(255,255,255,0.18)', color: 'var(--paper)',
              border: 'none', borderRadius: 999, padding: '3px 10px', cursor: 'pointer',
            }}
          >
            Release
          </button>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px' }}>

        {/* ── Header: stepper ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Link href="/" className="btn btn-ghost btn-sm" style={{ fontSize: 13 }}>
              ← Home
            </Link>
            <span className="mono" style={{ color: 'var(--ink-mute)', fontSize: 12 }}>
              Step {step + 1} of 5
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STEP_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => i < step ? setStep(i) : undefined}
                style={{
                  fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '6px 13px', borderRadius: 999,
                  border: i === step ? '2px solid var(--forest)' : '1px solid var(--line)',
                  background: i === step ? 'var(--forest)' : i < step ? 'var(--paper-2)' : 'transparent',
                  color: i === step ? 'var(--paper)' : i < step ? 'var(--moss)' : 'var(--ink-mute)',
                  cursor: i < step ? 'pointer' : 'default',
                  transition: 'all 160ms',
                }}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48, alignItems: 'start' }}>

          {/* ════════════════════════════════════
              LEFT — wizard steps
          ════════════════════════════════════ */}
          <div>

            {/* ─── Step 0: Occasion ─────────────────────────────────────── */}
            {step === 0 && (
              <div>
                <h2 style={{ marginBottom: 8 }}>Who is this tree for?</h2>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 28, fontFamily: 'var(--serif)', fontSize: 15 }}>
                  Pick an occasion — it shapes everything from species to the certificate.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {OCCASIONS.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setOccasionId(o.id)}
                      style={{
                        position: 'relative', textAlign: 'left', padding: '16px 18px',
                        borderRadius: 14,
                        border: occasionId === o.id ? '2px solid var(--forest)' : '1px solid var(--line)',
                        background: occasionId === o.id ? 'var(--paper-2)' : 'var(--paper)',
                        cursor: 'pointer', transition: 'all 160ms',
                      }}
                    >
                      {occasionId === o.id && (
                        <span style={{
                          position: 'absolute', top: 10, right: 10, width: 20, height: 20,
                          borderRadius: '50%', background: 'var(--forest)', color: 'var(--paper)',
                          display: 'grid', placeItems: 'center', fontSize: 11,
                        }}>✓</span>
                      )}
                      <span style={{
                        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                        background: o.accent, marginBottom: 8,
                      }} />
                      <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                        {o.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Step 1: Recipients ───────────────────────────────────── */}
            {step === 1 && (
              <div>
                <h2 style={{ marginBottom: 8 }}>Who's receiving a tree?</h2>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 24, fontFamily: 'var(--serif)', fontSize: 15 }}>
                  Name goes on the certificate and the tree's page.
                </p>

                {/* Single / Multiple toggle */}
                <div style={{
                  display: 'flex',
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: 4,
                  marginBottom: 28,
                  width: 'fit-content',
                  gap: 2,
                }}>
                  {[
                    { label: 'One person', value: false },
                    { label: 'Multiple people (up to 10)', value: true },
                  ].map(opt => (
                    <button
                      key={String(opt.value)}
                      onClick={() => {
                        setIsMulti(opt.value)
                        if (!opt.value && recipients.length > 1) {
                          setRecipients([recipients[0]])
                        }
                      }}
                      style={{
                        fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500,
                        padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                        background: isMulti === opt.value ? 'var(--forest)' : 'transparent',
                        color: isMulti === opt.value ? 'var(--paper)' : 'var(--ink-soft)',
                        transition: 'all 160ms',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* ── SINGLE mode ────────────────────────────────────────── */}
                {!isMulti && (
                  <div style={{ display: 'grid', gap: 20 }}>
                    <div className="field">
                      <label htmlFor="recipientName">Dedicated to *</label>
                      <input
                        id="recipientName"
                        type="text"
                        required
                        placeholder="e.g. Maa, Dadi, Baby Arjun"
                        value={recipients[0]?.name ?? ''}
                        onChange={e => updateRecipient(recipients[0].id, 'name', e.target.value)}
                      />
                    </div>

                    <div style={{ height: 1, background: 'var(--line)' }} />

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                          Their contact
                        </div>
                        <button
                          type="button"
                          onClick={fillMyDetails}
                          style={{
                            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
                            color: 'var(--forest)', background: 'none', border: 'none',
                            cursor: 'pointer', padding: 0, textDecoration: 'underline',
                          }}
                        >
                          Use my details →
                        </button>
                      </div>
                      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-mute)', marginBottom: 14, lineHeight: 1.5 }}>
                        We'll send them a shareable certificate link. When they create an account with this email, they'll see their tree and all future updates.
                      </p>
                      <div style={{ display: 'grid', gap: 12 }}>
                        <div className="field" style={{ margin: 0 }}>
                          <label htmlFor="employeeEmail">Their email *</label>
                          <input
                            id="employeeEmail"
                            type="email"
                            required
                            placeholder="their@email.com"
                            value={recipients[0]?.email ?? ''}
                            onChange={e => updateRecipient(recipients[0].id, 'email', e.target.value)}
                          />
                        </div>
                        <div className="field" style={{ margin: 0 }}>
                          <label htmlFor="employeePhone">Their phone (with country code) *</label>
                          <input
                            id="employeePhone"
                            type="tel"
                            required
                            placeholder="+91 XXXXX XXXXX"
                            value={recipients[0]?.phone ?? ''}
                            onChange={e => updateRecipient(recipients[0].id, 'phone', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MULTI mode ─────────────────────────────────────────── */}
                {isMulti && (
                  <div>
                    <div style={{
                      background: 'color-mix(in oklch, var(--forest) 6%, var(--paper))',
                      border: '1px solid color-mix(in oklch, var(--forest) 20%, var(--line))',
                      borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ fontSize: 16 }}>🌳</span>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--forest)', lineHeight: 1.5 }}>
                        Each person gets their own GPS-tagged tree, personalised certificate, and 12 months of photo updates. <strong>₹500 per tree.</strong>
                      </p>
                    </div>

                    <div style={{ display: 'grid', gap: 14 }}>
                      {recipients.map((rec, i) => {
                        const isComplete = rec.name.trim() && rec.phone.trim() && rec.speciesId
                        return (
                          <div
                            key={rec.id}
                            style={{
                              border: isComplete
                                ? '1px solid color-mix(in oklch, var(--forest) 35%, var(--line))'
                                : '1px solid var(--line)',
                              borderRadius: 14, padding: '16px',
                              background: isComplete ? 'color-mix(in oklch, var(--forest) 3%, var(--paper))' : 'var(--paper)',
                              transition: 'all 160ms',
                            }}
                          >
                            {/* Card header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                  width: 26, height: 26, borderRadius: '50%',
                                  background: isComplete ? 'var(--forest)' : 'var(--paper-3)',
                                  color: isComplete ? 'var(--paper)' : 'var(--ink-mute)',
                                  display: 'grid', placeItems: 'center',
                                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, flexShrink: 0,
                                }}>
                                  {isComplete ? '✓' : i + 1}
                                </span>
                                <span style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: isComplete ? 'var(--forest)' : 'var(--ink-mute)' }}>
                                  {rec.name.trim() || `Person ${i + 1}`}
                                  {rec.speciesId && (
                                    <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--ink-mute)', marginLeft: 6 }}>
                                      · {SPECIES.find(s => s.id === rec.speciesId)?.name}
                                    </span>
                                  )}
                                </span>
                              </div>
                              {recipients.length > 1 && (
                                <button
                                  onClick={() => removeRecipient(rec.id)}
                                  style={{
                                    fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)',
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
                                  }}
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>

                            {/* Row 1: Name + Phone */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                              <div className="field" style={{ margin: 0 }}>
                                <label style={{ fontSize: 11 }}>Name *</label>
                                <input
                                  type="text"
                                  placeholder={`Person ${i + 1}`}
                                  value={rec.name}
                                  onChange={e => updateRecipient(rec.id, 'name', e.target.value)}
                                  style={{ fontSize: 14, padding: '8px 12px' }}
                                />
                              </div>
                              <div className="field" style={{ margin: 0 }}>
                                <label style={{ fontSize: 11 }}>Phone * <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>(with country code)</span></label>
                                <input
                                  type="tel"
                                  placeholder="+91 XXXXX XXXXX"
                                  value={rec.phone}
                                  onChange={e => updateRecipient(rec.id, 'phone', e.target.value)}
                                  style={{ fontSize: 14, padding: '8px 12px' }}
                                />
                              </div>
                            </div>

                            {/* Row 2: Email + Species */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                              <div className="field" style={{ margin: 0 }}>
                                <label style={{ fontSize: 11 }}>Email <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>(optional)</span></label>
                                <input
                                  type="email"
                                  placeholder="their@email.com"
                                  value={rec.email}
                                  onChange={e => updateRecipient(rec.id, 'email', e.target.value)}
                                  style={{ fontSize: 14, padding: '8px 12px' }}
                                />
                              </div>
                              <div className="field" style={{ margin: 0 }}>
                                <label style={{ fontSize: 11 }}>
                                  Tree species *{loadingCounts && (
                                    <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}> (checking…)</span>
                                  )}
                                </label>
                                <select
                                  value={rec.speciesId}
                                  onChange={e => updateRecipient(rec.id, 'speciesId', e.target.value)}
                                  style={{ fontSize: 14, padding: '8px 12px' }}
                                >
                                  <option value="">Choose species…</option>
                                  {SPECIES.map(sp => {
                                    const count = speciesCounts[sp.id] ?? 0
                                    const soldOut = countsReady && count === 0
                                    const countLabel = countsReady
                                      ? soldOut ? ' — Sold out' : ` (${count} available)`
                                      : ''
                                    return (
                                      <option key={sp.id} value={sp.id} disabled={soldOut}>
                                        {sp.name} — {sp.symbolism}{countLabel}
                                      </option>
                                    )
                                  })}
                                </select>
                                {rec.speciesId && (speciesCounts[rec.speciesId] ?? 0) === 0 && countsReady && (
                                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--terra-deep)', marginTop: 4 }}>
                                    This species is sold out.{' '}
                                    <Link href="/waitlist" style={{ color: 'var(--terra-deep)', textDecoration: 'underline' }}>Join the waitlist</Link>
                                    {' '}or choose another.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Add more button */}
                    {recipients.length < MAX_RECIPIENTS && (
                      <button
                        onClick={addRecipient}
                        style={{
                          width: '100%',
                          marginTop: 10,
                          padding: '12px',
                          borderRadius: 12,
                          border: '1.5px dashed var(--line)',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontFamily: 'var(--display)',
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--forest)',
                          transition: 'all 140ms',
                        }}
                      >
                        + Add another person ({MAX_RECIPIENTS - recipients.length} more available)
                      </button>
                    )}

                    {/* Running total */}
                    {validRecipients.length > 0 && (
                      <div style={{
                        marginTop: 10,
                        padding: '12px 16px',
                        background: 'var(--paper-2)',
                        borderRadius: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div>
                          <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-soft)' }}>
                            {validRecipients.length} {validRecipients.length === 1 ? 'person' : 'people'} ready · ₹500 each
                          </span>
                          {recipients.length > validRecipients.length && (
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--terra)', letterSpacing: '0.06em', marginTop: 2 }}>
                              {recipients.length - validRecipients.length} incomplete — fill name, phone &amp; species
                            </div>
                          )}
                        </div>
                        <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 600, color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                          ₹{(validRecipients.length * 500).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── Step 2: Tree ─────────────────────────────────────────── */}
            {step === 2 && (
              <div>
                {isMulti ? (
                  /* ── MULTI: confirm gift list ────────────────────────── */
                  <div>
                    <h2 style={{ marginBottom: 8 }}>Confirm your gift list.</h2>
                    <p style={{ color: 'var(--ink-soft)', marginBottom: 24, fontFamily: 'var(--serif)', fontSize: 15 }}>
                      Review before we plant. Go back to make changes.
                    </p>

                    <div style={{ border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                      {/* Table header */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '28px 1fr 100px 120px',
                        gap: 12, padding: '10px 16px',
                        background: 'var(--paper-2)',
                        borderBottom: '1px solid var(--line)',
                      }}>
                        {['#', 'Name', 'Species', 'Contact'].map(h => (
                          <span key={h} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                            {h}
                          </span>
                        ))}
                      </div>
                      {/* Rows */}
                      {validRecipients.map((rec, i) => (
                        <div
                          key={rec.id}
                          style={{
                            display: 'grid', gridTemplateColumns: '28px 1fr 100px 120px',
                            gap: 12, padding: '12px 16px', alignItems: 'center',
                            borderBottom: i < validRecipients.length - 1 ? '1px solid var(--line)' : 'none',
                            background: 'var(--paper)',
                          }}
                        >
                          <span style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'var(--forest)', color: 'var(--paper)',
                            display: 'grid', placeItems: 'center',
                            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
                          }}>
                            {i + 1}
                          </span>
                          <div>
                            <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                              {rec.name}
                            </div>
                            {rec.email && (
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.03em', marginTop: 1 }}>
                                {rec.email}
                              </div>
                            )}
                          </div>
                          <div>
                            <span style={{
                              fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: 'var(--forest)',
                            }}>
                              {SPECIES.find(s => s.id === rec.speciesId)?.name ?? '—'}
                            </span>
                            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-mute)' }}>
                              {SPECIES.find(s => s.id === rec.speciesId)?.symbolism ?? ''}
                            </div>
                          </div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.03em' }}>
                            {rec.phone}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px',
                      background: 'color-mix(in oklch, var(--forest) 5%, var(--paper))',
                      border: '1px solid color-mix(in oklch, var(--forest) 20%, var(--line))',
                      borderRadius: 10,
                    }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-soft)' }}>
                        {validRecipients.length} trees · ₹500 each
                      </span>
                      <span style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 600, color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* ── SINGLE: pick individual tree ───────────────────── */
                  <div>
                    <h2 style={{ marginBottom: 8 }}>Choose your tree.</h2>
                    <p style={{ color: 'var(--ink-soft)', marginBottom: 20, fontFamily: 'var(--serif)', fontSize: 15 }}>
                      Each tree already lives in our farm. You're dedicating a real one.
                    </p>

                    {/* Species filter pills */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                      <button
                        onClick={() => setFilterSpeciesId('')}
                        style={{
                          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                          textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999,
                          border: filterSpeciesId === '' ? '2px solid var(--forest)' : '1px solid var(--line)',
                          background: filterSpeciesId === '' ? 'var(--forest)' : 'transparent',
                          color: filterSpeciesId === '' ? 'var(--paper)' : 'var(--ink-mute)',
                          cursor: 'pointer', transition: 'all 140ms',
                        }}
                      >All species</button>
                      {SPECIES.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setFilterSpeciesId(s.id)}
                          style={{
                            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
                            textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999,
                            border: filterSpeciesId === s.id ? '2px solid var(--forest)' : '1px solid var(--line)',
                            background: filterSpeciesId === s.id ? 'var(--forest)' : 'transparent',
                            color: filterSpeciesId === s.id ? 'var(--paper)' : 'var(--ink-mute)',
                            cursor: 'pointer', transition: 'all 140ms',
                          }}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>

                    {!loadingTrees && (
                      <p className="mono-sm" style={{ color: 'var(--ink-mute)', marginBottom: 16 }}>
                        {availableTrees.length} {availableTrees.length === 1 ? 'tree' : 'trees'} available to dedicate
                      </p>
                    )}

                    {loadingTrees && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
                      </div>
                    )}

                    {!loadingTrees && availableTrees.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        {availableTrees.map(tree => {
                          const isSelected = selectedTreeId === tree.id
                          const speciesMeta = SPECIES.find(s => s.id === tree.speciesId)
                          const plotLabel = tree.locationAddress
                            ? tree.locationAddress
                            : tree.plotBlock
                              ? `Block ${tree.plotBlock} · Row ${tree.plotRow} · Pos ${tree.plotPos}`
                              : 'Vasna Village, Kheda, Gujarat'

                          return (
                            <div
                              key={tree.id}
                              style={{
                                border: isSelected ? '2px solid var(--forest)' : '1px solid var(--line)',
                                borderRadius: 14, padding: '14px 16px',
                                background: isSelected ? 'var(--paper-2)' : 'var(--paper)',
                                transition: 'all 160ms',
                                display: 'flex', flexDirection: 'column', gap: 6,
                              }}
                            >
                              <span className="mono-sm" style={{ color: 'var(--ink-mute)', letterSpacing: '0.06em' }}>
                                {tree.uniqueId}
                              </span>
                              <div>
                                <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                                  {tree.speciesName}
                                </div>
                                {speciesMeta && (
                                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-mute)' }}>
                                    {speciesMeta.symbolism}
                                  </div>
                                )}
                              </div>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.06em' }}>
                                {plotLabel}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, gap: 8 }}>
                                <span style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 600, color: 'var(--terra)' }}>
                                  ₹{tree.price.toLocaleString('en-IN')}
                                </span>
                                <button
                                  onClick={() => setSelectedTreeId(isSelected ? null : tree.id)}
                                  className={isSelected ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
                                  style={{ flexShrink: 0 }}
                                >
                                  {isSelected ? 'Selected ✓' : 'Select'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {!loadingTrees && availableTrees.length === 0 && filterSpeciesId && (
                      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--moss)', padding: '24px 0' }}>
                        No trees available for this species right now. Try another species or check back soon.
                      </p>
                    )}

                    {!loadingTrees && availableTrees.length === 0 && !filterSpeciesId && (
                      <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-soft)', marginBottom: 16 }}>
                          We're currently sold out.
                        </p>
                        <Link href="/waitlist" className="btn btn-primary">
                          Join the waitlist →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── Step 3: Message ──────────────────────────────────────── */}
            {step === 3 && (
              <div>
                <h2 style={{ marginBottom: 8 }}>
                  {isMulti ? 'A shared message for everyone?' : 'What would you like to say?'}
                </h2>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 28, fontFamily: 'var(--serif)', fontSize: 15 }}>
                  {isMulti
                    ? `This message appears on all ${validRecipients.length} certificates. Optional, but beautiful.`
                    : 'This appears on the certificate and the tree\'s page. Optional, but beautiful.'}
                </p>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div className="field">
                    <label htmlFor="message">
                      Your message{' '}
                      <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>({message.length}/500)</span>
                    </label>
                    <textarea
                      id="message"
                      placeholder="Write something for them…"
                      value={message}
                      maxLength={500}
                      onChange={e => setMessage(e.target.value)}
                      style={{ minHeight: 120, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PREWRITTEN_MESSAGES.map(pm => (
                      <button
                        key={pm}
                        onClick={() => setMessage(pm)}
                        style={{
                          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13,
                          color: message === pm ? 'var(--forest-deep)' : 'var(--ink-soft)',
                          padding: '8px 14px', borderRadius: 999,
                          border: message === pm ? '1.5px solid var(--forest)' : '1px solid var(--line)',
                          background: message === pm ? 'var(--paper-2)' : 'var(--paper)',
                          cursor: 'pointer', transition: 'all 140ms',
                        }}
                      >
                        "{pm}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 4: Review ───────────────────────────────────────── */}
            {step === 4 && (
              <div>
                <h2 style={{ marginBottom: 8 }}>One last look.</h2>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 28, fontFamily: 'var(--serif)', fontSize: 15 }}>
                  Everything correct? Then let's make it real.
                </p>

                {timerExpired && (
                  <div style={{
                    background: 'color-mix(in srgb, var(--terra) 10%, var(--paper))',
                    border: '1px solid color-mix(in srgb, var(--terra) 30%, var(--line))',
                    borderRadius: 12, padding: '14px 18px', marginBottom: 20,
                    fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--terra-deep)',
                  }}>
                    Your reservation expired. Please start again and pick a tree.
                  </div>
                )}

                {/* ── Multi-recipient review ── */}
                {isMulti ? (
                  <div>
                    {/* Summary header */}
                    <div style={{
                      background: 'var(--paper-2)', border: '1px solid var(--line)',
                      borderRadius: 12, padding: '14px 18px', marginBottom: 16,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                        {validRecipients.length} trees · {occasion?.title ?? '—'}
                      </span>
                      <span style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 600, color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Recipient list */}
                    <div style={{ border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
                      {validRecipients.map((rec, i) => (
                        <div
                          key={rec.id}
                          style={{
                            display: 'grid', gridTemplateColumns: '26px 1fr auto auto',
                            alignItems: 'center', gap: 12,
                            padding: '12px 18px',
                            borderBottom: i < validRecipients.length - 1 ? '1px solid var(--line)' : 'none',
                            background: 'var(--paper)',
                          }}
                        >
                          <span style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--forest)', color: 'var(--paper)',
                            display: 'grid', placeItems: 'center',
                            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, flexShrink: 0,
                          }}>
                            {i + 1}
                          </span>
                          <div>
                            <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                              {rec.name}
                            </div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.03em' }}>
                              {rec.phone}{rec.email ? ` · ${rec.email}` : ''}
                            </div>
                          </div>
                          <span style={{
                            fontFamily: 'var(--display)', fontSize: 12, fontWeight: 500,
                            color: 'var(--moss)', background: 'color-mix(in oklch, var(--moss) 12%, var(--paper))',
                            border: '1px solid color-mix(in oklch, var(--moss) 25%, var(--line))',
                            padding: '3px 10px', borderRadius: 999,
                          }}>
                            {SPECIES.find(s => s.id === rec.speciesId)?.name ?? '—'}
                          </span>
                          <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>

                    {message && (
                      <div style={{
                        background: 'var(--paper-2)', borderLeft: '3px solid var(--terra)',
                        padding: '10px 14px', borderRadius: '0 10px 10px 0', marginBottom: 24,
                      }}>
                        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
                          "{message}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Single-recipient review ── */
                  <div>
                    <div style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
                      {[
                        { label: 'Occasion', value: occasion?.title || '—',                            back: 0 },
                        { label: 'For',      value: recipientName + (employeeEmail ? ` · ${employeeEmail}` : ''), back: 1 },
                        { label: 'Tree',     value: selectedTree
                            ? `${selectedTree.uniqueId} · ${selectedTree.speciesName}${selectedTree.plotBlock ? ` · Block ${selectedTree.plotBlock}` : ''}`
                            : 'Not selected',
                          back: 2 },
                        { label: 'Message',  value: message || 'None',                                  back: 3 },
                      ].map((row, i) => (
                        <div
                          key={row.label}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: '14px 18px',
                            borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
                            background: 'var(--paper)',
                          }}
                        >
                          <span style={{
                            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: 'var(--ink-mute)',
                            minWidth: 76, flexShrink: 0,
                          }}>
                            {row.label}
                          </span>
                          <span style={{
                            fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink)',
                            flex: 1, fontStyle: row.label === 'Message' ? 'italic' : 'normal',
                            wordBreak: 'break-word',
                          }}>
                            {row.value}
                          </span>
                          <button onClick={() => setStep(row.back)} className="btn btn-ghost btn-sm" style={{ fontSize: 12, flexShrink: 0 }}>
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>

                    {selectedTree && (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px', background: 'var(--paper-2)', borderRadius: 12, marginBottom: 24,
                      }}>
                        <span style={{ fontFamily: 'var(--display)', fontSize: 14, color: 'var(--ink-soft)' }}>Total</span>
                        <span style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                          ₹{selectedTree.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div style={{
                    background: 'color-mix(in srgb, var(--terra) 10%, var(--paper))',
                    border: '1px solid color-mix(in srgb, var(--terra) 30%, var(--line))',
                    borderRadius: 10, padding: '12px 16px', fontSize: 14,
                    fontFamily: 'var(--serif)', color: 'var(--terra-deep)', marginBottom: 20,
                  }}>
                    {error}
                  </div>
                )}

                {/* Auth gate */}
                {isLoggedIn === false && (
                  <div style={{ background: 'var(--forest)', borderRadius: 16, padding: '24px 24px 20px', marginBottom: 24 }}>
                    <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 600, color: 'var(--paper)', marginBottom: 8 }}>
                      You're one step away.
                    </h3>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'color-mix(in srgb, var(--paper) 75%, transparent)', marginBottom: 18, lineHeight: 1.55 }}>
                      Sign in or create an account to plant {isMulti ? `these ${validRecipients.length} trees` : 'your tree'}.
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                      <Link href="/auth/login?redirect=/plant" className="btn btn-terra">Sign in →</Link>
                      <Link href="/auth/register?redirect=/plant" className="btn btn-ghost" style={{ color: 'var(--paper)', borderColor: 'rgba(255,255,255,0.35)' }}>
                        Create account →
                      </Link>
                    </div>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'color-mix(in srgb, var(--paper) 55%, transparent)', letterSpacing: '0.04em' }}>
                      Your selections are saved — you'll return here after sign in.
                    </p>
                  </div>
                )}

                {isCorporate && companyName && isLoggedIn === true && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    borderRadius: 10, marginBottom: 16,
                    background: 'color-mix(in oklch, var(--forest) 8%, var(--paper))',
                    border: '1px solid color-mix(in oklch, var(--forest) 20%, var(--line))',
                  }}>
                    <span style={{ fontSize: 16 }}>🏢</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--forest)', letterSpacing: '0.06em' }}>
                      Certificate will read: <strong>Planted by {companyName}</strong>
                    </span>
                  </div>
                )}

                {/* Payment (single mode, after reservation) */}
                {!isMulti && reservedUntil && !timerExpired && (
                  <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, background: 'var(--paper)' }}>
                    <p className="eyebrow" style={{ marginBottom: 8 }}>Proceeding to payment</p>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>
                      Your tree is held for {formatCountdown(countdownMs)}. Complete payment to confirm.
                    </p>
                    <button
                      onClick={handleConfirmSingle}
                      className="btn btn-terra btn-lg"
                      disabled={confirming}
                      style={{ width: '100%' }}
                    >
                      {confirming ? 'Confirming…' : `Pay ₹${selectedTree?.price.toLocaleString('en-IN') ?? ''}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── Footer nav ───────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px dotted var(--line)' }}>
              <button
                onClick={goBack}
                className="btn btn-ghost btn-sm"
                disabled={step === 0}
                style={{ opacity: step === 0 ? 0.3 : 1 }}
              >
                ← Back
              </button>

              {step < 4 && (
                <button
                  onClick={goNext}
                  className="btn btn-primary"
                  disabled={!canContinue()}
                  style={{ opacity: canContinue() ? 1 : 0.4 }}
                >
                  Continue →
                </button>
              )}

              {/* Single mode: reserve button */}
              {step === 4 && !isMulti && isLoggedIn === true && !reservedUntil && !timerExpired && (
                <button
                  onClick={handleReserve}
                  className="btn btn-terra"
                  disabled={reserving || !selectedTreeId}
                  style={{ opacity: selectedTreeId ? 1 : 0.4 }}
                >
                  {reserving ? 'Reserving…' : `Reserve this tree · ₹${selectedTree?.price.toLocaleString('en-IN') ?? ''}`}
                </button>
              )}

              {/* Multi mode: confirm all */}
              {step === 4 && isMulti && isLoggedIn === true && (
                <button
                  onClick={handleConfirmMulti}
                  className="btn btn-terra btn-lg"
                  disabled={confirming || validRecipients.length === 0}
                >
                  {confirming
                    ? `Planting ${validRecipients.length} trees…`
                    : `Plant ${validRecipients.length} trees · ₹${totalPrice.toLocaleString('en-IN')}`}
                </button>
              )}

              {step === 4 && isLoggedIn === false && (
                <Link href="/auth/login?redirect=/plant" className="btn btn-primary">
                  Sign in to continue
                </Link>
              )}

              {step === 4 && isLoggedIn === null && (
                <span className="mono-sm" style={{ color: 'var(--ink-mute)' }}>Checking…</span>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════
              RIGHT — summary card
          ════════════════════════════════════ */}
          <div style={{ position: 'sticky', top: 100, border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', background: 'var(--paper)' }}>

            {isMulti && validRecipients.length > 0 ? (
              /* Multi mode summary */
              <div style={{ padding: '20px' }}>
                <div className="photo-ph" style={{ height: 120, borderRadius: 12, marginBottom: 16 }}>
                  <span>Native trees · Kheda farm</span>
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                  {occasion?.title ?? 'Occasion not chosen'}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--moss)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                  {validRecipients.length} {validRecipients.length === 1 ? 'recipient' : 'recipients'} ready
                </div>
                <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
                  {validRecipients.slice(0, 5).map((r, i) => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'var(--forest)', color: 'var(--paper)',
                        display: 'grid', placeItems: 'center',
                        fontFamily: 'var(--mono)', fontSize: 9, flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.name || '—'}
                      </span>
                      {r.speciesId && (
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--moss)', flexShrink: 0 }}>
                          {SPECIES.find(s => s.id === r.speciesId)?.name}
                        </span>
                      )}
                    </div>
                  ))}
                  {validRecipients.length > 5 && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', paddingLeft: 28 }}>
                      +{validRecipients.length - 5} more
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink-soft)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              /* Single mode summary */
              <>
                <div className="photo-ph" style={{ height: 150 }}>
                  <span>{selectedTree?.speciesName ?? 'Your tree'} · Kheda farm</span>
                </div>
                <div style={{ padding: '18px 20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: occasion?.accent ?? 'var(--line)', flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: occasion ? 'var(--ink)' : 'var(--ink-mute)' }}>
                      {occasion?.title ?? 'Not chosen yet'}
                    </span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{
                      fontFamily: 'var(--serif)', fontSize: 15,
                      color: recipientName ? 'var(--ink)' : 'var(--ink-mute)',
                      fontWeight: recipientName ? 500 : 400,
                      fontStyle: recipientName ? 'normal' : 'italic',
                    }}>
                      {recipientName || '—'}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>Tree</span>
                    {selectedTree ? (
                      <div>
                        <span className="mono-sm" style={{ color: 'var(--ink-mute)' }}>{selectedTree.uniqueId}</span>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                          {selectedTree.speciesName}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: 14 }}>Not selected</span>
                    )}
                  </div>
                  {message && (
                    <div style={{ background: 'var(--paper-2)', borderLeft: '3px solid var(--terra)', padding: '8px 12px', borderRadius: '0 8px 8px 0', marginBottom: 14 }}>
                      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
                        "{message.length > 80 ? message.slice(0, 80) + '…' : message}"
                      </p>
                    </div>
                  )}
                  {selectedTree && (
                    <div style={{ paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                          ₹{selectedTree.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      {reservedUntil && !timerExpired && (
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--terra)',
                          background: 'color-mix(in srgb, var(--terra) 12%, var(--paper))',
                          border: '1px solid color-mix(in srgb, var(--terra) 30%, var(--line))',
                          borderRadius: 999, padding: '4px 10px',
                        }}>
                          ⏱ {formatCountdown(countdownMs)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

export default function PlantPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', background: 'var(--paper)' }}>
        <span className="mono" style={{ color: 'var(--ink-mute)' }}>Loading…</span>
      </div>
    }>
      <PlantWizardInner />
    </Suspense>
  )
}
