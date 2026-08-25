export default function TrustStrip() {
  const stats = [
    { stat: 'GPS', label: 'Tagged & verified', sub: 'Every tree gets coordinates' },
    { stat: '94%', label: '3-year survival', sub: 'Guaranteed replant otherwise' },
    { stat: '12', label: 'Months of photos', sub: 'On the 1st of every month' },
    { stat: 'Sat', label: 'Farm visits', sub: 'Open every Saturday 8am–5pm' },
    { stat: '80G', label: 'Tax deductible', sub: 'Certificate issued for every dedication' },
  ]

  return (
    <section className="tight" style={{ background: 'var(--paper-2)', padding: '48px 0' }}>
      <div className="container">
        <div className="trust-grid">
          {stats.map((s, i) => (
            <div
              key={i}
              className="trust-item"
              style={{
                padding: '8px 32px',
                textAlign: 'center',
                borderRight: i < stats.length - 1
                  ? '1px dotted var(--line)'
                  : 'none',
              }}
            >
              <div style={{
                fontFamily: 'var(--display)',
                fontSize: 'clamp(28px, 3vw, 42px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
                lineHeight: 1,
                marginBottom: '8px',
              }}>{s.stat}</div>
              <div className="mono-sm" style={{ marginBottom: '4px', color: 'var(--ink-soft)' }}>{s.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-mute)', fontFamily: 'var(--serif)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
