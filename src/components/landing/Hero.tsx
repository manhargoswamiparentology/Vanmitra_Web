'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { OCCASIONS } from '@/data/constants'

// ── Image config — set enabled: false to revert to placeholder ──
const IMAGES = {
  enabled: true,
  occasions: {
    mother:      '/images/occasions/mother.png',
    memory:      '/images/occasions/memory.png',
    special:     '/images/occasions/special.png',
    newborn:     '/images/occasions/newborn.png',
    anniversary: '/images/occasions/anniversary.png',
    festival:    '/images/occasions/festival.png',
    corporate:   '/images/occasions/corporate.png',
    self:        '/images/occasions/self.png',
  } as Record<string, string>,
}

function useCountUp(target: number, duration: number = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

export default function Hero() {
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS.find(o => o.id === 'memory') ?? OCCASIONS[0])
  const [treesLost, setTreesLost] = useState(0)
  const plantedCount = useCountUp(12847, 1800)

  useEffect(() => {
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 / 60
      setTreesLost(Math.floor(elapsed * 27))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const visibleOccasions = OCCASIONS.slice(0, 6)
  const occasionImg = IMAGES.occasions[selectedOccasion.id]

  return (
    <section style={{ padding: '96px 0' }}>
      <div className="wide-container">

        {/* Urgency Ticker */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'color-mix(in oklch, var(--terra) 8%, var(--paper))',
          border: '1px solid color-mix(in oklch, var(--terra) 20%, var(--line))',
          borderRadius: '999px',
          padding: '8px 18px',
          marginBottom: '24px',
          width: 'fit-content',
        }}>
          <span className="pulse-dot" style={{
            width: '8px',
            height: '8px',
            background: 'var(--terra)',
            borderRadius: '50%',
            flexShrink: 0,
            display: 'block',
          }} />
          <span className="mono-sm" style={{ color: 'var(--terra)', textTransform: 'none', letterSpacing: '0.04em', fontSize: '12px' }}>
            India lost <strong>{treesLost}</strong> trees while you've been on this page.
          </span>
        </div>

        {/* Two-column grid */}
        <div className="hero-grid">

          {/* Left Column */}
          <div>
            <p className="eyebrow" style={{ marginBottom: '28px' }}>Kheda · Gujarat · est. 2024</p>

            <h1 style={{ marginBottom: '32px', lineHeight: 1.05 }}>
              <span style={{ display: 'block', fontFamily: 'var(--display)' }}>Your grandfather</span>
              <span style={{ display: 'block', fontFamily: 'var(--display)' }}>planted a tree.</span>
              <span style={{ display: 'block', fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--moss)', fontSize: 'clamp(42px, 6vw, 90px)' }}>The chain breaks</span>
              <span style={{ display: 'block', fontFamily: 'var(--display)' }}>with you—&nbsp;<span className="wavy">unless.</span></span>
            </h1>

            <p style={{ fontSize: '18px', color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: '16px', maxWidth: '520px' }}>
              India has lost 2.33 million hectares of forest since 2000. Every city summer is longer. Every monsoon, a little less predictable. The trees that should have been planted two decades ago weren't.
            </p>
            <p style={{ fontSize: '18px', color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: '36px', maxWidth: '520px' }}>
              A native tree goes into the ground with someone's name on it — someone you love, someone you've lost, or simply yourself. It will outlive all of us.
            </p>

            {/* Occasion pills */}
            <div style={{ marginBottom: '28px' }}>
              <p className="mono-sm" style={{ marginBottom: '12px', color: 'var(--ink-mute)' }}>I'm planting this for…</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {visibleOccasions.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => setSelectedOccasion(occ)}
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '8px 16px',
                      borderRadius: '999px',
                      border: selectedOccasion.id === occ.id
                        ? '1px solid var(--forest)'
                        : '1px solid var(--line)',
                      background: selectedOccasion.id === occ.id
                        ? 'var(--forest)'
                        : 'var(--paper)',
                      color: selectedOccasion.id === occ.id
                        ? 'var(--paper)'
                        : 'var(--ink-soft)',
                      cursor: 'pointer',
                      transition: 'all 160ms',
                    }}
                  >
                    {occ.title}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link
                href={`/plant?occasion=${selectedOccasion.id}`}
                className="btn btn-primary btn-lg"
              >
                Plant {selectedOccasion.title}
              </Link>
              <a href="#how-it-works" className="btn btn-ghost">
                <span>▶</span> See how it works
              </a>
            </div>

            {/* 3-stat strip */}
            <hr className="dotted-rule" style={{ margin: '0 0 28px 0' }} />
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(22px, 2.5vw, 32px)',
                  fontWeight: 500,
                  color: 'var(--terra)',
                  letterSpacing: '-0.02em',
                }}>−14M / yr</div>
                <div className="mono-sm">Trees lost in India annually</div>
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(22px, 2.5vw, 32px)',
                  fontWeight: 500,
                  color: 'var(--forest)',
                  letterSpacing: '-0.02em',
                }}>+{plantedCount.toLocaleString('en-IN')}</div>
                <div className="mono-sm">Trees planted by Vanamitra</div>
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(22px, 2.5vw, 32px)',
                  fontWeight: 500,
                  color: 'var(--moss)',
                  letterSpacing: '-0.02em',
                }}>94%</div>
                <div className="mono-sm">3-year survival rate</div>
              </div>
            </div>
          </div>

          {/* Right Column — Occasion Card */}
          <div className="hero-right" style={{ position: 'relative' }}>
            <div className="card" style={{ aspectRatio: '4/5', display: 'flex', flexDirection: 'column' }}>

              {/* Photo area */}
              <div style={{ flex: '1 1 0', minHeight: 0, position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                {IMAGES.enabled && occasionImg ? (
                  <Image
                    key={selectedOccasion.id}
                    src={occasionImg}
                    alt={selectedOccasion.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    style={{ objectFit: 'cover', transition: 'opacity 300ms' }}
                    priority
                  />
                ) : (
                  <div className="photo-ph" style={{ position: 'absolute', inset: 0, borderRadius: 0 }}>
                    <span>{selectedOccasion.species[0]} · 18-month sapling</span>
                  </div>
                )}
                {/* Floating stamp */}
                <div className="stamp" style={{
                  position: 'absolute',
                  top: '-22px',
                  right: '-22px',
                  zIndex: 2,
                }}>
                  Photo / updates / monthly
                </div>
              </div>

              {/* Card body */}
              <div className="card-body" style={{ borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: selectedOccasion.accent,
                    flexShrink: 0,
                    display: 'block',
                  }} />
                  <span style={{
                    fontFamily: 'var(--display)',
                    fontSize: '18px',
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}>{selectedOccasion.title}</span>
                </div>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: 'var(--ink-soft)',
                  marginBottom: '8px',
                }}>{selectedOccasion.tagline}</p>
                <p style={{ fontSize: '14px', color: 'var(--ink-mute)', marginBottom: '16px' }}>{selectedOccasion.note}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 500, color: 'var(--ink)' }}>Real tree · GPS verified</span>
                  <Link
                    href={`/plant?occasion=${selectedOccasion.id}`}
                    className="btn btn-terra btn-sm"
                  >
                    Choose this →
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
