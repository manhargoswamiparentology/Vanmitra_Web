'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SPECIES, OCCASIONS } from '@/data/constants'

export default function CertificateTeaser() {
  const [dedicatedTo, setDedicatedTo] = useState('')
  const [from, setFrom]               = useState('')
  const [speciesId, setSpeciesId]     = useState(SPECIES[0].id)
  const [occasionId, setOccasionId]   = useState(OCCASIONS[0].id)

  const selectedSpecies = SPECIES.find((s) => s.id === speciesId) ?? SPECIES[0]
  const selectedOccasion = OCCASIONS.find((o) => o.id === occasionId) ?? OCCASIONS[0]
  const displayDedicated = dedicatedTo.trim() || 'Someone special'
  const displayFrom      = from.trim()        || 'A loving heart'

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <section style={{ background: 'var(--forest)', color: 'var(--paper)', padding: '96px 0' }}>
      <div className="wide-container">
        <div className="cert-grid">

          {/* ── Left — copy + inputs ── */}
          <div>
            <p className="eyebrow" style={{
              color: 'color-mix(in oklch, var(--leaf) 80%, var(--paper))',
              marginBottom: '24px',
            }}>Your dedication, preserved</p>

            <h2 style={{ color: 'var(--paper)', marginBottom: '24px' }}>
              A certificate worth keeping
            </h2>
            <p style={{ fontSize: '17px', color: 'color-mix(in oklch, var(--paper) 70%, var(--forest))', lineHeight: 1.7, marginBottom: '36px' }}>
              Every tree planted comes with a printable, digital dedication certificate — your name, the dedicatee's name, species chosen, GPS coordinates, and a QR code that links to your tree's growing page. Frame it. Send it. Keep it.
            </p>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>

              {/* Dedicated to */}
              <div className="field">
                <label style={{ color: 'color-mix(in oklch, var(--paper) 55%, var(--forest))' }}>Dedicated to</label>
                <input
                  type="text"
                  placeholder="e.g. Maa, Rajan, Baby Arjun…"
                  value={dedicatedTo}
                  onChange={(e) => setDedicatedTo(e.target.value)}
                  style={{
                    background: 'oklch(0.26 0.04 150)',
                    border: '1px solid oklch(0.40 0.05 150)',
                    color: 'var(--paper)',
                    fontFamily: 'var(--serif)',
                    fontSize: '16px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>

              {/* From */}
              <div className="field">
                <label style={{ color: 'color-mix(in oklch, var(--paper) 55%, var(--forest))' }}>From</label>
                <input
                  type="text"
                  placeholder="Your name or family name"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{
                    background: 'oklch(0.26 0.04 150)',
                    border: '1px solid oklch(0.40 0.05 150)',
                    color: 'var(--paper)',
                    fontFamily: 'var(--serif)',
                    fontSize: '16px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>

              {/* Occasion */}
              <div className="field">
                <label style={{ color: 'color-mix(in oklch, var(--paper) 55%, var(--forest))' }}>Occasion</label>
                <select
                  value={occasionId}
                  onChange={(e) => setOccasionId(e.target.value)}
                  style={{
                    background: 'oklch(0.26 0.04 150)',
                    border: '1px solid oklch(0.40 0.05 150)',
                    color: 'var(--paper)',
                    fontFamily: 'var(--serif)',
                    fontSize: '16px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    outline: 'none',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  {OCCASIONS.map((o) => (
                    <option key={o.id} value={o.id} style={{ background: 'oklch(0.26 0.04 150)' }}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Species */}
              <div className="field">
                <label style={{ color: 'color-mix(in oklch, var(--paper) 55%, var(--forest))' }}>Species</label>
                <select
                  value={speciesId}
                  onChange={(e) => setSpeciesId(e.target.value)}
                  style={{
                    background: 'oklch(0.26 0.04 150)',
                    border: '1px solid oklch(0.40 0.05 150)',
                    color: 'var(--paper)',
                    fontFamily: 'var(--serif)',
                    fontSize: '16px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    outline: 'none',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  {SPECIES.map((sp) => (
                    <option key={sp.id} value={sp.id} style={{ background: 'oklch(0.26 0.04 150)' }}>
                      {sp.name} — {sp.latin}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Link href="/plant" className="btn btn-terra btn-lg">
              Plant this tree →
            </Link>
          </div>

          {/* ── Right — live certificate preview matching the real one ── */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div
              className="cert-preview"
              style={{
                aspectRatio: '1 / 1.41',
                width: '100%',
                maxWidth: '440px',
                background: 'oklch(0.97 0.018 85)',
                border: '1px solid color-mix(in oklch, var(--terra) 40%, var(--line))',
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--terra) 30%, transparent),
                            inset 0 0 0 8px oklch(0.97 0.018 85),
                            inset 0 0 0 10px color-mix(in oklch, var(--terra) 20%, transparent),
                            0 32px 64px -20px oklch(0.18 0.04 150 / 0.5)`,
                borderRadius: 4,
                padding: '40px 44px',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                color: 'var(--ink)',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: 'var(--forest)', letterSpacing: '-0.01em' }}>
                  Vanam<span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>itra</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                  Certificate №<br />
                  <span style={{ color: 'var(--ink)', fontWeight: 600 }}>SAMPLE</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
                <p className="eyebrow" style={{ justifyContent: 'flex-start', fontSize: 10, color: 'var(--terra)', margin: 0 }}>
                  {selectedOccasion.tagline}
                </p>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(20px, 3.5vw, 30px)',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}>
                  {selectedSpecies.name} tree
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-mute)' }}>
                  {selectedSpecies.latin}
                </div>

                <div style={{ height: 1, background: 'color-mix(in oklch, var(--terra) 30%, transparent)', margin: '8px 0' }} />

                <p style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink-mute)', letterSpacing: '0.04em', margin: 0 }}>
                  Has been planted in honour of
                </p>
                <div style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(20px, 3.5vw, 28px)',
                  fontWeight: 400,
                  color: 'var(--ink)',
                  lineHeight: 1.2,
                }}>
                  {displayDedicated}
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)' }}>
                  {displayFrom}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 28,
                paddingTop: 16,
                borderTop: '1px dotted color-mix(in oklch, var(--terra) 30%, transparent)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 8.5,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                  lineHeight: 1.7,
                }}>
                  Tree: VM-SAMPLE<br />
                  Location: Vasna Village, Kheda<br />
                  Date: {today}
                </div>
                <div className="stamp" style={{ width: 80, height: 80, fontSize: 8, padding: 10, lineHeight: 1.5 }}>
                  Living<br />tribute<br />· est 2026 ·
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
