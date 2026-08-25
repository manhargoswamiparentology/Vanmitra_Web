import Link from 'next/link'
import Image from 'next/image'
import { OCCASIONS } from '@/data/constants'

// ── Image config — set enabled: false to revert to placeholder ──
const IMAGES = {
  enabled: true,
}

export default function OccasionGrid() {
  return (
    <section>
      <div className="container-narrow">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: '20px' }}>
            Plant for any occasion
          </p>
          <h2>
            Eight ways to grow something{' '}
            <span style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontWeight: 400,
            }}>that lasts</span>
          </h2>
        </div>

        <div className="occasion-grid" style={{ alignItems: 'stretch' }}>
          {OCCASIONS.map((occ, i) => (
            <div key={occ.id} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {i === 0 && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
                  <span className="tag solid">Most loved</span>
                </div>
              )}

              {/* Photo */}
              <div style={{ aspectRatio: '5/4', position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0', flexShrink: 0 }}>
                {IMAGES.enabled ? (
                  <Image
                    src={`/images/occasions/${occ.id}.png`}
                    alt={occ.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="photo-ph" style={{ position: 'absolute', inset: 0, borderRadius: 0 }}>
                    <span>{occ.species[0]}</span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: occ.accent,
                    flexShrink: 0,
                    display: 'block',
                  }} />
                  <span style={{
                    fontFamily: 'var(--display)',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}>{occ.title}</span>
                </div>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: '14px',
                  color: 'var(--ink-soft)',
                  marginBottom: '8px',
                  lineHeight: 1.5,
                }}>{occ.tagline}</p>
                <p className="mono-sm" style={{ marginBottom: '14px', color: 'var(--ink-mute)' }}>
                  {occ.species[0]}{occ.species[1] ? ` · ${occ.species[1]}` : ''}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <Link
                    href={`/plant?occasion=${occ.id}`}
                    className="btn btn-terra btn-sm"
                    style={{ fontSize: '13px', padding: '8px 14px' }}
                  >
                    Plant →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
