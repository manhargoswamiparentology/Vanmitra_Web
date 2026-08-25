import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OCCASIONS, SPECIES, TESTIMONIALS } from '@/data/constants'

interface Props {
  params: Promise<{ occasion: string }>
}

export default async function OccasionPage({ params }: Props) {
  const { occasion: occasionSlug } = await params
  const occasion = OCCASIONS.find(o => o.id === occasionSlug)
  if (!occasion) notFound()

  const recommendedSpecies = SPECIES.filter(s => occasion.species.includes(s.name))
  const fallbackSpecies = recommendedSpecies.length ? recommendedSpecies : SPECIES.slice(0, 2)
  const primarySpecies = fallbackSpecies[0]

  const filteredTestimonials = TESTIMONIALS.filter(t =>
    t.occasion.toLowerCase().includes(occasion.title.toLowerCase().split(' ').pop()?.toLowerCase() || '')
  )
  const displayTestimonials = filteredTestimonials.length >= 2
    ? filteredTestimonials.slice(0, 2)
    : TESTIMONIALS.slice(0, 2)

  return (
    <div style={{ background: 'var(--paper)' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '20px 0 0' }}>
        <div className="container">
          <p className="mono" style={{ color: 'var(--ink-mute)' }}>
            <Link href="/" style={{ color: 'var(--ink-mute)', textDecoration: 'none' }}>Home</Link>
            {' › '}
            <Link href="/plant" style={{ color: 'var(--ink-mute)', textDecoration: 'none' }}>Dedicate a tree</Link>
            {' › '}
            <span style={{ color: 'var(--ink)' }}>{occasion.title}</span>
          </p>
        </div>
      </div>

      {/* Hero */}
      <section style={{ padding: '64px 0 80px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 64,
            alignItems: 'center',
          }}>
            {/* Copy */}
            <div>
              <p className="eyebrow" style={{ marginBottom: 20, color: occasion.accent }}>
                {occasion.tagline}
              </p>
              <h1 style={{ marginBottom: 20, lineHeight: 1.05 }}>
                {occasion.title}
              </h1>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 18,
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
                marginBottom: 24,
                maxWidth: 480,
              }}>
                {occasion.note}
              </p>

              {primarySpecies && (
                <div style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  marginBottom: 28,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--moss)',
                    flexShrink: 0,
                  }}>
                    We recommend
                  </span>
                  <div>
                    <span style={{
                      fontFamily: 'var(--display)',
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'var(--ink)',
                    }}>
                      {primarySpecies.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      fontSize: 13,
                      color: 'var(--ink-mute)',
                      marginLeft: 8,
                    }}>
                      — {primarySpecies.symbolism}
                    </span>
                  </div>
                </div>
              )}

              <Link
                href={`/plant?occasion=${occasion.id}`}
                className="btn btn-primary btn-lg"
              >
                Plant a tree · ₹500
              </Link>
            </div>

            {/* Photo placeholder */}
            <div className="photo-ph" style={{ height: 420, borderRadius: 20 }}>
              <span>{occasion.title}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ padding: '40px 0', background: 'var(--paper-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { stat: 'GPS-tagged', detail: 'Every tree gets coordinates' },
              { stat: '94%', detail: 'Survival rate at 3 years' },
              { stat: 'Monthly', detail: 'Photos from the farm' },
              { stat: 'Saturdays', detail: 'Visit your tree any week' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--forest)',
                  letterSpacing: '-0.02em',
                  marginBottom: 4,
                }}>
                  {item.stat}
                </div>
                <div style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 13,
                  color: 'var(--ink-mute)',
                }}>
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why this species */}
      {primarySpecies && (
        <section>
          <div className="container">
            <h2 style={{ marginBottom: 48, textAlign: 'center' }}>
              Why{' '}
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                {primarySpecies.name}?
              </span>
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 56,
              alignItems: 'center',
            }}>
              <div className="photo-ph" style={{ height: 360, borderRadius: 16 }}>
                <span>{primarySpecies.name} · {primarySpecies.latin}</span>
              </div>
              <div>
                <p className="eyebrow" style={{ marginBottom: 20 }}>
                  {primarySpecies.symbolism}
                </p>
                <h3 style={{ marginBottom: 16, fontSize: 'clamp(20px, 2vw, 28px)' }}>
                  A tree that endures
                </h3>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 17,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}>
                  The {primarySpecies.name} ({primarySpecies.latin}) has grown across the Gujarat plains for
                  centuries. Known for {primarySpecies.symbolism.toLowerCase()}, it lives {primarySpecies.life}
                  and reaches {primarySpecies.height} — creating shelter for birds, insects, and the soil itself.
                </p>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 17,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}>
                  It is a native species, which means it builds real ecological relationships rather than
                  standing alone. When you plant a {primarySpecies.name}, you are joining a living network
                  that has existed here far longer than any of us.
                </p>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[
                    ['Lifespan', primarySpecies.life],
                    ['Height', primarySpecies.height],
                    ['Native', primarySpecies.native ? 'Yes' : 'Adapted'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 9,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-mute)',
                        marginBottom: 4,
                      }}>
                        {k}
                      </div>
                      <div style={{
                        fontFamily: 'var(--display)',
                        fontSize: 15,
                        fontWeight: 500,
                        color: 'var(--ink)',
                      }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)' }}>
        <div className="container-narrow">
          <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: 24, textAlign: 'center' }}>
            From the people who planted
          </p>
          <h2 style={{ textAlign: 'center', marginBottom: 48, fontSize: 'clamp(28px, 3vw, 44px)' }}>
            Real dedications, real trees
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {displayTestimonials.map((t, i) => (
              <div key={i} style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: '24px 26px',
              }}>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'var(--ink)',
                  lineHeight: 1.65,
                  marginBottom: 20,
                  borderLeft: '3px solid var(--terra)',
                  paddingLeft: 16,
                }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--display)',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--ink)',
                    }}>
                      {t.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-mute)',
                    }}>
                      {t.city}
                    </div>
                  </div>
                  <span className="tag">
                    {t.occasion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section style={{ background: 'var(--forest)', padding: '96px 0' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <p className="eyebrow" style={{
            justifyContent: 'center',
            marginBottom: 24,
            color: 'color-mix(in oklch, var(--leaf) 80%, var(--paper))',
          }}>
            Plant today
          </p>
          <h2 style={{
            color: 'var(--paper)',
            marginBottom: 20,
            lineHeight: 1.1,
          }}>
            One tree. One name.{' '}
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--gold)' }}>
              One hundred years.
            </span>
          </h2>
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 17,
            color: 'color-mix(in oklch, var(--paper) 70%, var(--forest))',
            lineHeight: 1.7,
            marginBottom: 36,
          }}>
            {occasion.note}
          </p>
          <Link
            href={`/plant?occasion=${occasion.id}`}
            className="btn btn-terra btn-lg"
          >
            Plant a {primarySpecies?.name || 'tree'} · ₹500 →
          </Link>
        </div>
      </section>
    </div>
  )
}
