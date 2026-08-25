import { SPECIES } from '@/data/constants'
import Image from 'next/image'
import Link from 'next/link'

// ── Image config — set enabled: false to revert to SVG silhouettes ──
const IMAGES = {
  enabled: true,
}

// SVG silhouette fallback — kept in case IMAGES.enabled = false
const CANOPY_SIZES: Record<string, { r1: number; r2: number; r3: number; rTrunk: number; hTrunk: number }> = {
  neem:      { r1: 36, r2: 28, r3: 22, rTrunk: 6,  hTrunk: 28 },
  mango:     { r1: 40, r2: 30, r3: 20, rTrunk: 7,  hTrunk: 24 },
  peepal:    { r1: 44, r2: 34, r3: 24, rTrunk: 5,  hTrunk: 26 },
  banyan:    { r1: 50, r2: 38, r3: 26, rTrunk: 9,  hTrunk: 22 },
  drumstick: { r1: 24, r2: 18, r3: 14, rTrunk: 4,  hTrunk: 36 },
  gulmohar:  { r1: 42, r2: 32, r3: 22, rTrunk: 6,  hTrunk: 20 },
  arjun:     { r1: 38, r2: 30, r3: 22, rTrunk: 7,  hTrunk: 30 },
}

function TreeSilhouette({ id }: { id: string }) {
  const s = CANOPY_SIZES[id] ?? CANOPY_SIZES.neem
  const svgH = 120
  const cx = 70
  const trunkY = svgH - 10
  const trunkH = s.hTrunk
  const baseY = trunkY - trunkH
  return (
    <svg width="140" height={svgH} viewBox={`0 0 140 ${svgH}`} fill="none" aria-hidden="true">
      <rect x={cx - s.rTrunk / 2} y={baseY} width={s.rTrunk} height={trunkH} rx={s.rTrunk / 2} fill="var(--terra-deep)" opacity={0.7} />
      <circle cx={cx}                    cy={baseY - s.r1 * 0.5} r={s.r1} fill="var(--forest)" opacity={0.25} />
      <circle cx={cx - s.r2 * 0.55}     cy={baseY - s.r1 * 0.4} r={s.r2} fill="var(--forest)" opacity={0.35} />
      <circle cx={cx + s.r3 * 0.55}     cy={baseY - s.r1 * 0.6} r={s.r3} fill="var(--moss)"   opacity={0.45} />
    </svg>
  )
}

export default function SpeciesSection() {
  return (
    <section id="species">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: '20px' }}>What we plant</p>
          <h2>Seven native trees, one living gift</h2>
        </div>

        <div className="species-grid">
          {SPECIES.map((sp, i) => (
            <div
              key={sp.id}
              className="species-cell"
              style={{
                padding: '28px 24px',
                borderRight: (i % 4) < 3 ? '1px solid var(--line)' : 'none',
                borderBottom: i < 4 ? '1px solid var(--line)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Tree image or SVG fallback */}
              {IMAGES.enabled ? (
                <div style={{
                  width: 160,
                  height: 160,
                  borderRadius: 16,
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: 16,
                  border: '1px solid var(--line)',
                }}>
                  <Image
                    src={`/images/species/${sp.id}.png`}
                    alt={`${sp.name} tree`}
                    fill
                    sizes="160px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div style={{ marginTop: 0 }}>
                  <TreeSilhouette id={sp.id} />
                </div>
              )}

              <div style={{ marginTop: IMAGES.enabled ? 0 : '16px', width: '100%' }}>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: '17px',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: '2px',
                }}>{sp.name}</div>
                <div style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: '13px',
                  color: 'var(--ink-mute)',
                  marginBottom: '10px',
                }}>{sp.latin}</div>
                <div style={{ marginBottom: '12px' }}>
                  <span className="tag" style={{
                    background: sp.native
                      ? 'color-mix(in oklch, var(--forest) 12%, var(--paper))'
                      : 'color-mix(in oklch, var(--terra) 10%, var(--paper))',
                    borderColor: sp.native ? 'var(--moss)' : 'var(--terra)',
                    color: sp.native ? 'var(--forest)' : 'var(--terra-deep)',
                    fontSize: '10px',
                  }}>
                    {sp.native ? 'Native' : 'Non-native'}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: '6px', textAlign: 'left' }}>
                  {[
                    { label: 'Lives',      value: sp.life      },
                    { label: 'Height',     value: sp.height    },
                    { label: 'Symbolism',  value: sp.symbolism },
                  ].map((row) => (
                    <div key={row.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '8px',
                    }}>
                      <span className="mono-sm" style={{ flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* 8th cell — soft CTA */}
          <div style={{
            padding: '28px 24px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'color-mix(in oklch, var(--forest) 5%, var(--paper))',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'color-mix(in oklch, var(--forest) 15%, var(--paper))',
              display: 'grid',
              placeItems: 'center',
              fontSize: '22px',
            }}>🌿</div>
            <p style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: '15px',
              color: 'var(--ink-soft)',
              lineHeight: 1.6,
            }}>
              All species are native to Gujarat
            </p>
            <Link href="/plant" className="btn btn-outline btn-sm">
              Choose by occasion →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
