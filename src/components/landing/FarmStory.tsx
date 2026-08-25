import Link from 'next/link'
import Image from 'next/image'

export default function FarmStory() {
  return (
    <section>
      <div className="container">
        <div className="farm-grid">

          {/* Left */}
          <div>
            <p className="eyebrow" style={{ marginBottom: '24px' }}>Vasna village · Kheda · Gujarat</p>
            <h2 style={{ marginBottom: '28px' }}>
              Ten acres tended
              <br />
              every{' '}
              <span style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}>single morning</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '20px' }}>
              The farm in Vasna is not a plantation in any industrial sense. It is twelve people walking rows before sunrise, checking guards, pressing soil, noting which saplings need a second stake after last week's wind. It is slow, careful, physical work — and it shows in a 94% survival rate over three years.
            </p>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '40px' }}>
              Every tree planted here has a name — sometimes yours, sometimes your mother's, sometimes a name that can no longer answer when called. That is the kind of work we do.
            </p>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '40px',
            }}>
              {[
                { stat: '10', unit: 'acres', label: 'Farm area' },
                { stat: '12', unit: 'hands', label: 'Farm workers' },
                { stat: '4', unit: 'collectives', label: 'Partner NGOs' },
              ].map((s) => (
                <div key={s.stat} style={{ borderTop: '2px solid var(--line)', paddingTop: '16px' }}>
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontSize: 'clamp(28px, 2.5vw, 38px)',
                    fontWeight: 500,
                    color: 'var(--ink)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}>{s.stat}</div>
                  <div className="mono-sm" style={{ marginTop: '4px' }}>{s.unit}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-mute)', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Link href="/farm" className="btn btn-ghost">
              Visit the farm →
            </Link>
          </div>

          {/* Right */}
          <div style={{ position: 'relative' }}>
            {/* Main photo */}
            <div style={{
              borderRadius: '16px',
              aspectRatio: '4/5',
              border: '1px solid var(--line)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <Image
                src="/images/farm/farm-wide.png"
                alt="The Kheda farm — Vanamitra, Vasna village"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>

            {/* Overlapping quote card */}
            <div className="farm-quote" style={{
              position: 'absolute',
              bottom: '-28px',
              left: '-28px',
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: '14px',
              padding: '20px',
              maxWidth: '300px',
              boxShadow: '0 12px 40px -10px oklch(0.22 0.02 80 / 0.18)',
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Portrait */}
                <div className="photo-ph" style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                }}>
                  <span style={{ fontSize: '8px' }}>KS</span>
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--serif)',
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: 'var(--ink-soft)',
                    lineHeight: 1.6,
                    marginBottom: '10px',
                  }}>
                    "I have watered saplings for thirty years. Every time someone visits their tree — I feel I did not waste my life."
                  </p>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>Karsanbhai</div>
                  <div className="mono-sm" style={{ fontSize: '10px' }}>Farm lead · Vasna</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
