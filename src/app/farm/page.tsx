import Link from 'next/link'
import Image from 'next/image'

// ── Image config — set enabled: false to revert to placeholders ──
const IMAGES = {
  enabled: true,
  farmWide:         '/images/farm/farm-wide.png',
  farmMarkers:      '/images/farm/farm-markers.png',
  farmEmotional:    '/images/farm/farm_emotionalshot.png',
}

export const metadata = {
  title: 'Our Farm — Vasna Village, Kheda District · Vanamitra',
  description: 'Ten acres of good work. Our farm in Vasna village, Kheda district, Gujarat — open every Saturday, 8 am to 5 pm.',
}

const TEAM = [
  { name: 'Karsanbhai Patel', role: 'Farm Lead', bio: 'Three generations in Vasna village. Knows the land\'s groundwater table from memory. Has overseen every planting since March 2024.' },
  { name: 'Rinaben Solanki', role: 'Field Photographer', bio: 'Trained on the job. Walks every dedicated tree on the first of the month, documents, uploads. Her photos are why dedicators stay connected.' },
  { name: 'Dharmesh Thakor', role: 'Irrigation & Care', bio: 'Manages all drip systems and seasonal mulching. Has not lost a tree to drought yet in two years.' },
  { name: 'Manishaben Rathod', role: 'Nursery Coordinator', bio: 'Liaises with our Nadiad nursery partner, quality-checks every incoming sapling, and maintains the species register.' },
]

export default function FarmPage() {
  return (
    <div style={{ background: 'var(--paper)' }}>

      {/* Intro */}
      <section>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 72,
            alignItems: 'start',
          }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 20 }}>
                March 2024 — present
              </p>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', marginBottom: 24 }}>
                Vanamitra began here, on this land.
              </h2>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 17,
                color: 'var(--ink-soft)',
                lineHeight: 1.75,
                marginBottom: 20,
              }}>
                Vanamitra began in March 2024 with a lease on 10 acres of degraded agricultural land
                in Vasna village, Kheda district — about 55 km east of Ahmedabad. The soil had been
                farmed intensively for a decade and left fallow for two years before we took it over.
                It needed work. That was the point.
              </p>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 17,
                color: 'var(--ink-soft)',
                lineHeight: 1.75,
                marginBottom: 20,
              }}>
                We spent the first three months amending soil chemistry, installing 2.4 km of drip
                irrigation mainline, and building the boundary fence. Our first trees — 40 Neem and
                30 Peepal saplings — went into the ground on April 12, 2024. Most of them are now
                taller than the person who planted them.
              </p>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 17,
                color: 'var(--ink-soft)',
                lineHeight: 1.75,
              }}>
                Today the farm holds 847 dedicated trees across seven species. The earliest trees
                are entering their second monsoon. The oldest are over a metre tall. We are on track
                to plant 1,000 trees by December 2026.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 0 }}>
              {/* 3 offset photo placeholders */}
              <div style={{ position: 'relative', height: 480 }}>

                {/* Photo 1 — farm wide */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: 260, borderRadius: 14, overflow: 'hidden' }}>
                  {IMAGES.enabled ? (
                    <Image src={IMAGES.farmWide} alt="Farm rows at Vanamitra" fill sizes="30vw" style={{ objectFit: 'cover' }} priority />
                  ) : (
                    <div className="photo-ph" style={{ position: 'absolute', inset: 0, borderRadius: 14 }}>
                      <span>Farm rows · April 2025</span>
                    </div>
                  )}
                </div>

                {/* Photo 2 — farm markers */}
                <div style={{ position: 'absolute', top: 30, left: '42%', width: '58%', height: 240, borderRadius: 14, overflow: 'hidden' }}>
                  {IMAGES.enabled ? (
                    <Image src={IMAGES.farmMarkers} alt="Tree markers on the Vanamitra farm" fill sizes="30vw" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="photo-ph" style={{ position: 'absolute', inset: 0, borderRadius: 14 }}>
                      <span>Neem sapling · year 1</span>
                    </div>
                  )}
                </div>

                {/* Photo 3 — emotional farm shot */}
                <div style={{ position: 'absolute', bottom: 0, left: '15%', width: '65%', height: 200, borderRadius: 14, overflow: 'hidden' }}>
                  {IMAGES.enabled ? (
                    <Image src={IMAGES.farmEmotional} alt="Life on the Vanamitra farm" fill sizes="30vw" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="photo-ph" style={{ position: 'absolute', inset: 0, borderRadius: 14 }}>
                      <span>Planting day · team</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)' }}>
        <div className="container-narrow">
          <p className="eyebrow" style={{ marginBottom: 20, textAlign: 'center', justifyContent: 'center' }}>
            The team
          </p>
          <h2 style={{
            textAlign: 'center',
            marginBottom: 52,
            fontSize: 'clamp(26px, 3vw, 40px)',
          }}>
            Thirteen people,{' '}
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
              every morning at six.
            </span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 32,
          }}>
            {TEAM.map((member, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Circle photo placeholder */}
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: `color-mix(in oklch, var(--forest) ${15 + i * 5}%, var(--paper-2))`,
                  border: '2px solid var(--line)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--display)',
                  fontSize: 22,
                  fontWeight: 500,
                  color: 'var(--forest)',
                }}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    marginBottom: 2,
                  }}>
                    {member.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--moss)',
                    marginBottom: 8,
                  }}>
                    {member.role}
                  </div>
                  <p style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 14,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.6,
                  }}>
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm map */}
      <section>
        <div className="container-narrow">
          <p className="eyebrow" style={{ marginBottom: 20, justifyContent: 'center', textAlign: 'center' }}>
            Plot layout
          </p>
          <h2 style={{
            textAlign: 'center',
            marginBottom: 12,
            fontSize: 'clamp(24px, 2.8vw, 38px)',
          }}>
            10 acres, 8 blocks
          </h2>
          <p style={{
            textAlign: 'center',
            fontFamily: 'var(--serif)',
            fontSize: 16,
            color: 'var(--ink-mute)',
            marginBottom: 48,
          }}>
            GPS coordinates are assigned per block. Each dedicated tree gets a numbered marker.
          </p>

          {/* SVG map */}
          <div style={{
            border: '1px solid var(--line)',
            borderRadius: 20,
            overflow: 'hidden',
            background: 'var(--paper-2)',
            padding: '40px 48px',
          }}>
            <svg
              viewBox="0 0 600 380"
              width="100%"
              style={{ display: 'block', maxHeight: 380 }}
              aria-label="Farm block map showing 8 planting blocks across 10 acres"
            >
              {/* Background grid */}
              <rect x="0" y="0" width="600" height="380" fill="none" />

              {/* Farm boundary */}
              <rect
                x="20" y="20" width="560" height="340"
                fill="color-mix(in oklch, var(--forest) 4%, white)"
                stroke="var(--forest)"
                strokeWidth="2"
                rx="8"
              />

              {/* North label */}
              <text x="300" y="14" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="gray" letterSpacing="2">N ↑</text>

              {/* 8 blocks in 4x2 grid */}
              {[
                { id: 'A', x: 40, y: 40, w: 120, h: 130, label: 'Block A', species: 'Neem · 120 trees' },
                { id: 'B', x: 180, y: 40, w: 120, h: 130, label: 'Block B', species: 'Peepal · 90 trees' },
                { id: 'C', x: 320, y: 40, w: 120, h: 130, label: 'Block C', species: 'Mango · 110 trees' },
                { id: 'D', x: 460, y: 40, w: 100, h: 130, label: 'Block D', species: 'Banyan · 60 trees' },
                { id: 'E', x: 40, y: 195, w: 120, h: 145, label: 'Block E', species: 'Gulmohar · 80 trees' },
                { id: 'F', x: 180, y: 195, w: 120, h: 145, label: 'Block F', species: 'Arjun · 75 trees' },
                { id: 'G', x: 320, y: 195, w: 120, h: 145, label: 'Block G', species: 'Drumstick · 65 trees' },
                { id: 'H', x: 460, y: 195, w: 100, h: 145, label: 'Block H', species: 'Mixed · 247 trees' },
              ].map(block => (
                <g key={block.id}>
                  <rect
                    x={block.x} y={block.y} width={block.w} height={block.h}
                    fill="color-mix(in oklch, var(--forest) 8%, white)"
                    stroke="color-mix(in oklch, var(--forest) 40%, transparent)"
                    strokeWidth="1.5"
                    rx="6"
                  />
                  {/* Block number circle */}
                  <circle
                    cx={block.x + 18} cy={block.y + 18} r={13}
                    fill="var(--forest)"
                  />
                  <text
                    x={block.x + 18} y={block.y + 22}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="11"
                    fontWeight="600"
                    fill="white"
                  >
                    {block.id}
                  </text>
                  <text
                    x={block.x + block.w / 2} y={block.y + block.h / 2 - 6}
                    textAnchor="middle"
                    fontFamily="Bricolage Grotesque, system-ui, sans-serif"
                    fontSize="11"
                    fontWeight="500"
                    fill="oklch(0.30 0.05 150)"
                  >
                    {block.label}
                  </text>
                  <text
                    x={block.x + block.w / 2} y={block.y + block.h / 2 + 10}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="8.5"
                    fill="oklch(0.45 0.03 80)"
                    letterSpacing="0.5"
                  >
                    {block.species}
                  </text>
                </g>
              ))}

              {/* Road annotation */}
              <line x1="300" y1="360" x2="300" y2="370" stroke="var(--terra)" strokeWidth="1" strokeDasharray="3,2" />
              <text x="300" y="378" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="oklch(0.55 0.08 45)">
                Main entrance · State Highway 17
              </text>
            </svg>
          </div>

          <p style={{
            textAlign: 'center',
            marginTop: 16,
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
          }}>
            Approximate layout · GPS pins shared when you visit
          </p>
        </div>
      </section>

      {/* Saturdays CTA */}
      <section style={{ background: 'var(--forest)', padding: '96px 0' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <p className="eyebrow" style={{
            justifyContent: 'center',
            marginBottom: 24,
            color: 'color-mix(in oklch, var(--leaf) 80%, var(--paper))',
          }}>
            Open every Saturday
          </p>
          <h2 style={{
            color: 'var(--paper)',
            marginBottom: 20,
            lineHeight: 1.1,
          }}>
            8 am – 5 pm.{' '}
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--gold)' }}>
              Walk in.
            </span>
          </h2>
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 18,
            color: 'color-mix(in oklch, var(--paper) 75%, var(--forest))',
            lineHeight: 1.7,
            marginBottom: 12,
          }}>
            We are open every Saturday, 8 am – 5 pm. Walk in, find your tree, sit under it.
          </p>
          <p style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'color-mix(in oklch, var(--paper) 60%, var(--forest))',
            lineHeight: 1.6,
            marginBottom: 40,
          }}>
            Bring water. We will provide chai.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/plant" className="btn btn-terra btn-lg">
              Plant a tree first →
            </Link>
            <Link href="/journal/where-donation-goes" className="btn btn-ghost btn-sm" style={{
              borderColor: 'color-mix(in oklch, var(--paper) 40%, transparent)',
              color: 'var(--paper)',
            }}>
              How it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
