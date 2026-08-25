import Link from 'next/link'
import Image from 'next/image'

// ── Image config — set enabled: false to revert to text-only steps ──
const IMAGES = {
  enabled: true,
}

const STEPS = [
  {
    n: '01',
    title: 'Choose & dedicate',
    body: 'Pick your occasion, choose a native species, and write a short dedication. Takes two minutes. We save it forever on your tree\'s page.',
    image: '/images/how-it-works/step-1-choose.png',
    imageAlt: 'Choosing a tree species on Vanamitra',
  },
  {
    n: '02',
    title: 'We plant near Ahmedabad',
    body: 'Your sapling goes into the ground on our farm in Gujarat, close to Ahmedabad. Once your purchase is confirmed, we share the precise GPS location of your tree.',
    image: '/images/how-it-works/step-2-plant.png',
    imageAlt: 'Planting a sapling on the Vanamitra farm',
  },
  {
    n: '03',
    title: 'Photos every month',
    body: 'On the 1st of every month you receive a photo and a note from the team — your tree growing, season by season, year by year.',
    image: '/images/how-it-works/step-3-grow.png',
    imageAlt: 'Monthly photo update of a growing tree',
  },
  {
    n: '04',
    title: 'Visit any Saturday',
    body: 'The farm is open every Saturday, 8 am to 5 pm. Walk to your tree\'s row, touch the bark, sit under it. We\'ll have chai waiting.',
    image: '/images/farm/farm-wide.png',
    imageAlt: 'Vanamitra farm in Vasna village, Kheda',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: 'var(--paper-2)' }}>
      <div className="container-narrow">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: '20px' }}>The process</p>
          <h2 style={{ marginBottom: '20px' }}>Simple. Verifiable. Yours.</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink-soft)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.65 }}>
            No black boxes, no forestry jargon, no distant unknown farm. Here is every step, in order.
          </p>
        </div>

        <div className="how-grid">
          {STEPS.map((step, i) => (
            <div key={step.n} className="how-step" style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
              <div style={{ padding: '0 28px', flex: 1 }}>

                {/* Step image */}
                {IMAGES.enabled && (
                  <div style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 12,
                    marginBottom: 20,
                    border: '1px solid var(--line)',
                  }}>
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="mono" style={{
                  color: 'var(--terra)',
                  fontSize: '13px',
                  marginBottom: '14px',
                  display: 'block',
                }}>{step.n}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '12px', lineHeight: 1.2 }}>{step.title}</h3>
                <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.65 }}>{step.body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="how-arrow" style={{
                  paddingTop: IMAGES.enabled ? '100px' : '6px',
                  color: 'var(--ink-mute)',
                  fontFamily: 'var(--display)',
                  fontSize: '20px',
                  flexShrink: 0,
                  userSelect: 'none',
                }}>→</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '56px' }}>
          <Link href="/plant" className="btn btn-primary btn-lg">
            Start planting
          </Link>
        </div>
      </div>
    </section>
  )
}
