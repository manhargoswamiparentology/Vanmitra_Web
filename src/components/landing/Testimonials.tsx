import { TESTIMONIALS } from '@/data/constants'

export default function Testimonials() {
  return (
    <section>
      <div className="container-narrow">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: '20px' }}>People who planted</p>
          <h2>They'll tell you themselves</h2>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Occasion tag */}
              <div>
                <span className="mono-sm" style={{ color: 'var(--moss)' }}>{t.occasion}</span>
              </div>

              {/* Opening quote mark */}
              <div style={{
                fontFamily: 'var(--serif)',
                fontSize: '28px',
                lineHeight: 1,
                color: 'var(--moss)',
                fontStyle: 'italic',
              }}>"</div>

              {/* Quote text */}
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'var(--ink-soft)',
                flex: 1,
              }}>
                {t.text}
              </p>

              {/* Footer */}
              <div style={{
                borderTop: '1px dotted var(--line)',
                paddingTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'color-mix(in oklch, var(--forest) 15%, var(--paper))',
                  border: '1px solid var(--line)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--display)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--forest)',
                  flexShrink: 0,
                }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                    {t.name}
                  </div>
                  <div className="mono-sm" style={{ fontSize: '10px' }}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
