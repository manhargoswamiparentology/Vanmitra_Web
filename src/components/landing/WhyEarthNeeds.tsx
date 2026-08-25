import Link from 'next/link'

export default function WhyEarthNeeds() {
  const stats = [
    {
      tone: 'terra',
      borderColor: 'var(--terra)',
      stat: '−2.33M',
      unit: 'hectares',
      label: 'India forest loss since 2000',
      detail: 'That is an area larger than Sikkim and Goa combined, gone in one generation.',
    },
    {
      tone: 'terra',
      borderColor: 'var(--terra)',
      stat: '+1.5°C',
      unit: 'warming',
      label: 'Above pre-industrial levels',
      detail: 'The threshold scientists feared we\'d cross by 2050. We\'re already here.',
    },
    {
      tone: 'gold',
      borderColor: 'var(--gold)',
      stat: '24 kg',
      unit: 'CO₂ / year',
      label: 'Absorbed per mature native tree',
      detail: 'One tree offsets roughly 2,400 km of driving every year it lives.',
    },
    {
      tone: 'gold',
      borderColor: 'var(--gold)',
      stat: '50 yrs',
      unit: 'of shade',
      label: 'Minimum lifespan, native species',
      detail: 'Most of our species live 100–900 years. This gift outlives everyone in your family.',
    },
  ]

  return (
    <section style={{ background: 'var(--forest)', color: 'var(--paper)', padding: '96px 0' }}>
      <div className="wide-container">
        <div className="why-grid">

          {/* Left */}
          <div>
            <p className="eyebrow" style={{
              color: 'color-mix(in oklch, var(--leaf) 80%, var(--paper))',
              marginBottom: '28px',
            }}>
              Why Earth needs this — now
            </p>

            <h2 style={{ color: 'var(--paper)', marginBottom: '32px', lineHeight: 1.05 }}>
              <span style={{ display: 'block' }}>We are the first</span>
              <span style={{ display: 'block' }}>generation that</span>
              <span style={{
                display: 'block',
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--gold)',
                fontSize: 'clamp(34px, 4.2vw, 60px)',
              }}>knows.</span>
            </h2>

            <p style={{ fontSize: '17px', color: 'color-mix(in oklch, var(--paper) 75%, var(--forest))', lineHeight: 1.7, marginBottom: '20px' }}>
              Ahmedabad summers now routinely cross 47°C. The koel that used to call from your grandmother's neem tree starts earlier each year — because the tree it needs is gone. These are not abstractions. They are the texture of a childhood being erased.
            </p>
            <p style={{ fontSize: '17px', color: 'color-mix(in oklch, var(--paper) 75%, var(--forest))', lineHeight: 1.7, marginBottom: '40px' }}>
              Planting a tree won't stop climate change by itself. But it is the most direct, verifiable act available to a person in India right now. It cools the air. It holds water in the soil. It returns a corridor for the koel. And it lasts long after the motivation that planted it.
            </p>

            <Link href="/plant" className="btn btn-terra btn-lg">
              Plant one now →
            </Link>
          </div>

          {/* Right — 4 stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-inner" style={{
                borderLeft: `3px solid ${s.borderColor}`,
                background: 'oklch(0.24 0.03 145)',
                padding: '20px',
                borderRadius: '12px',
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontSize: 'clamp(22px, 2vw, 30px)',
                    fontWeight: 500,
                    color: s.borderColor,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    marginBottom: '4px',
                  }}>{s.stat}</div>
                  <div className="mono-sm" style={{ color: 'color-mix(in oklch, var(--paper) 50%, var(--forest))', marginBottom: '6px' }}>{s.unit}</div>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--display)', fontWeight: 500, color: 'var(--paper)' }}>{s.label}</div>
                </div>
                <p style={{ fontSize: '13px', color: 'color-mix(in oklch, var(--paper) 65%, var(--forest))', lineHeight: 1.6 }}>{s.detail}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Closing quote */}
        <div style={{
          maxWidth: '720px',
          margin: '64px auto 0',
          paddingTop: '40px',
          borderTop: '1px dotted color-mix(in oklch, var(--paper) 25%, var(--forest))',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 2vw, 24px)',
            color: 'color-mix(in oklch, var(--paper) 80%, var(--forest))',
            lineHeight: 1.6,
          }}>
            "The best time to plant a tree was twenty years ago. The second best time is today — and today, we can do it together, 55 km from where you sit reading this."
          </p>
        </div>

      </div>
    </section>
  )
}
