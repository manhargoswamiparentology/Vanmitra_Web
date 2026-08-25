import Link from 'next/link'
import CSRForm from './CSRForm'

export const metadata = {
  title: 'CSR & Corporate Plantations · Vanamitra',
  description: 'Plant forests for your team. Bulk tree dedications with GPS reporting, branded certificates, and team visit days. From 100 to 50,000 trees.',
}

const TIERS = [
  {
    name: 'Sapling',
    trees: '100 trees',
    price: '₹50,000',
    priceNote: '₹500 / tree',
    featured: false,
    features: [
      'GPS-tagged planting across 1 block',
      'Digital certificates for all trees',
      'Monthly photo updates for 3 years',
      '80G tax-deductible receipt',
      'Team visit day (weekday)',
    ],
    cta: 'Talk to us',
  },
  {
    name: 'Grove',
    trees: '500 trees',
    price: '₹2,00,000',
    priceNote: '₹400 / tree',
    featured: true,
    features: [
      'GPS-tagged planting across 2–3 blocks',
      'Branded certificates with company name',
      'Monthly photo + growth report PDFs',
      '80G tax-deductible receipt',
      '2 team visit days + guided tour',
      'Dedicated account manager',
    ],
    cta: 'Talk to us',
  },
  {
    name: 'Forest',
    trees: '2,000+ trees',
    price: 'Custom',
    priceNote: 'volume pricing',
    featured: false,
    features: [
      'Dedicated blocks, named grove option',
      'Full ESG reporting package',
      'Quarterly in-person briefings',
      '80G receipt + CA-certified report',
      'Unlimited team visits',
      'Custom species selection',
      'Drone survey annually',
    ],
    cta: 'Talk to us',
  },
]

const LOGOS = ['Tata', 'Infosys', 'HUL', 'Adani', 'Reliance', 'Local NGOs']

export default function CSRPage() {
  return (
    <div style={{ background: 'var(--paper)' }}>

      {/* Hero */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 72,
            alignItems: 'center',
          }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 20 }}>
                CSR &amp; corporate planting
              </p>
              <h1 style={{
                fontSize: 'clamp(40px, 5.5vw, 76px)',
                lineHeight: 1.05,
                marginBottom: 24,
              }}>
                For teams that
                <br />
                want to{' '}
                <span style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  color: 'var(--forest)',
                }}>
                  give back
                </span>
                <br />
                together.
              </h1>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 18,
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
                marginBottom: 32,
                maxWidth: 480,
              }}>
                Bulk plantations from 100 to 50,000 trees. GPS-tagged, photographed monthly, with
                full ESG reporting. Every tree is a real sapling in the ground — not an offset
                credit or a pledge.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#enquiry" className="btn btn-terra btn-lg">
                  Make an enquiry →
                </a>
                <Link href="/journal/where-donation-goes" className="btn btn-ghost btn-sm">
                  How the money works
                </Link>
              </div>
            </div>

            <div className="photo-ph" style={{ height: 440, borderRadius: 20 }}>
              <span>Corporate visit day · Kheda farm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section style={{ padding: '40px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <p className="mono-sm" style={{
            textAlign: 'center',
            color: 'var(--ink-mute)',
            marginBottom: 24,
          }}>
            Trusted by
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 16,
            alignItems: 'center',
          }}>
            {LOGOS.map(logo => (
              <div key={logo} style={{
                textAlign: 'center',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-mute)',
                padding: '14px 8px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                background: 'var(--paper-2)',
              }}>
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section>
        <div className="container-narrow">
          <p className="eyebrow" style={{ marginBottom: 20, textAlign: 'center', justifyContent: 'center' }}>
            Pricing
          </p>
          <h2 style={{
            textAlign: 'center',
            marginBottom: 52,
            fontSize: 'clamp(26px, 3vw, 42px)',
          }}>
            Simple, transparent pricing
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            alignItems: 'stretch',
          }}>
            {TIERS.map(tier => (
              <div
                key={tier.name}
                style={{
                  border: tier.featured ? '2px solid var(--forest)' : '1px solid var(--line)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  background: tier.featured ? 'color-mix(in oklch, var(--forest) 4%, var(--paper))' : 'var(--paper)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {tier.featured && (
                  <div style={{
                    background: 'var(--forest)',
                    color: 'var(--paper)',
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    padding: '8px',
                  }}>
                    Most chosen
                  </div>
                )}

                <div style={{ padding: '28px 28px 24px' }}>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--moss)',
                    marginBottom: 6,
                  }}>
                    {tier.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontSize: 32,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}>
                    {tier.price}
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-mute)',
                    marginBottom: 12,
                  }}>
                    {tier.priceNote}
                  </div>
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'var(--forest)',
                    marginBottom: 20,
                  }}>
                    {tier.trees}
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                    {tier.features.map((f, i) => (
                      <li key={i} style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        fontFamily: 'var(--serif)',
                        fontSize: 14,
                        color: 'var(--ink-soft)',
                        lineHeight: 1.5,
                      }}>
                        <span style={{ color: 'var(--moss)', flexShrink: 0, marginTop: 1 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '0 28px 28px', marginTop: 'auto' }}>
                  <a
                    href="#enquiry"
                    className={`btn ${tier.featured ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {tier.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: 'center',
            marginTop: 24,
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
          }}>
            All packages include 80G tax deductible receipts · Prices exclusive of GST
          </p>
        </div>
      </section>

      {/* Why Vanamitra for CSR */}
      <section style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)' }}>
        <div className="container-narrow">
          <h2 style={{
            textAlign: 'center',
            marginBottom: 48,
            fontSize: 'clamp(24px, 2.8vw, 38px)',
          }}>
            Why companies choose{' '}
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Vanamitra</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { title: 'Real trees, not offsets', body: 'Every tree is a sapling in the ground on our Kheda farm. We send GPS coordinates and photos — not certificates from a third-party registry.' },
              { title: 'Full ESG documentation', body: 'Species name, GPS pin, planting date, three-year survival data, and annual drone surveys — all in a format your auditor can verify.' },
              { title: 'Your team, in person', body: 'Bring your team to the farm on a Saturday. Walk the grove your company planted. Sit under it. We prepare the GPS trail and provide chai.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: '24px',
              }}>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: 10,
                }}>
                  {item.title}
                </div>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.65,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquiry">
        <div className="container-narrow">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: 72,
            alignItems: 'start',
          }}>
            {/* Left copy */}
            <div style={{ position: 'sticky', top: 100 }}>
              <p className="eyebrow" style={{ marginBottom: 20 }}>
                Get in touch
              </p>
              <h2 style={{ fontSize: 'clamp(24px, 2.8vw, 36px)', marginBottom: 20, lineHeight: 1.15 }}>
                Let's plant a forest
                {' '}
                <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                  for your team.
                </span>
              </h2>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 16,
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
                marginBottom: 28,
              }}>
                Tell us what you're thinking and we'll come back with a proposal tailored to your
                budget, timeline, and team size. Most CSR projects are turned around in 3–4 weeks.
              </p>
              <div style={{ display: 'grid', gap: 14 }}>
                {[
                  ['Response time', 'Within 1 business day'],
                  ['Minimum order', '100 trees · ₹50,000'],
                  ['Tax benefit', '80G deductible'],
                  ['Visit', 'Every Saturday'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-mute)',
                    }}>
                      {k}
                    </span>
                    <span style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 14,
                      color: 'var(--ink)',
                      textAlign: 'right',
                    }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: '32px 36px',
            }}>
              <CSRForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
