import Link from 'next/link'
import CorporateForm from './CorporateForm'

export const metadata = {
  title: 'Corporate Tree Gifting · Vanamitra',
  description:
    'Give your employees a gift that grows. Real trees planted in their name — with GPS, monthly photos, and a certificate they\'ll keep for life. The Diwali gift that outlives everything else.',
}

const OCCASIONS = [
  { icon: '🪔', title: 'Diwali', note: 'The festival of light, met with a gift of life.' },
  { icon: '🎂', title: 'Work anniversary', note: 'One tree for every year they showed up.' },
  { icon: '🤝', title: 'New joiner welcome', note: 'Their first day, and their first tree.' },
  { icon: '🏆', title: 'Employee of the month', note: 'Recognition that lasts longer than a plaque.' },
  { icon: '🌸', title: 'Holi / New Year', note: 'A living celebration of new beginnings.' },
  { icon: '🎓', title: 'Retirement farewell', note: 'The gift that grows while they rest.' },
]

const WHAT_THEY_GET = [
  {
    step: '01',
    title: 'A tree in their name',
    body: 'A real native sapling — Neem, Mango, Peepal, Banyan — is planted on our Kheda farm with your employee\'s name attached to it. Not a pledge. Not a credit. A sapling pressing into Gujarat soil.',
  },
  {
    step: '02',
    title: 'A certificate worth framing',
    body: 'Their name, your company\'s name, GPS coordinates, the species — on a printable certificate they\'ll still have in 20 years. Most employees put it on their wall. Some send it to their parents.',
  },
  {
    step: '03',
    title: 'Monthly photos for a year',
    body: 'On the 1st of every month, they receive a photo of their tree from our farm team. First season. First monsoon. First real leaves. They watch something grow — because of their work.',
  },
  {
    step: '04',
    title: 'The right to visit it',
    body: 'The farm is open every Saturday. An employee can bring their family, walk to their tree\'s row, and touch the bark. We\'ll have chai waiting. That visit never leaves memory.',
  },
]

const WHY_IT_WORKS = [
  {
    icon: '🧠',
    title: 'They will never forget it',
    body: 'Dry fruit boxes are forgotten by January. A tree with their name — that they can visit, photograph, and show their children — is remembered for life. That\'s the difference between a transaction and a relationship.',
  },
  {
    icon: '🌱',
    title: 'Your company did something real',
    body: 'ESG reports get longer. Sustainability pledges multiply. But employees can tell the difference between a number in a PDF and a tree they walked to on a Saturday morning. One of these creates belief.',
  },
  {
    icon: '❤️',
    title: 'It says: we see you',
    body: 'The best gift a company can give an employee isn\'t money or gadgets. It\'s proof of recognition. A tree in their name — something alive, permanent, and growing — says "what you do here matters." That\'s retention you can\'t buy on a salary spreadsheet.',
  },
  {
    icon: '🌍',
    title: 'Your brand stands for something',
    body: 'Every certificate carries your company\'s name alongside a living tree. When that employee shares it — with their family, on LinkedIn, on a Saturday farm visit — your brand is attached to the most honest environmental act a company can take.',
  },
]

const WHAT_INCLUDED = [
  'One real tree per employee, planted in their name on our Kheda farm',
  'Personalised digital certificate — name, species, GPS coordinates',
  '12 months of photo updates direct from our farm team',
  'Shareable certificate link for WhatsApp, email, or printing',
  'Each employee can visit their tree any Saturday',
]

export default function CorporatePage() {
  return (
    <div style={{ background: 'var(--paper)' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--forest)',
        color: 'var(--paper)',
        padding: '96px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle texture dots */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, var(--paper) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: 72,
            alignItems: 'center',
          }}>
            <div>
              <p className="eyebrow" style={{
                color: 'color-mix(in oklch, var(--leaf) 80%, var(--paper))',
                marginBottom: 24,
                justifyContent: 'flex-start',
              }}>
                Corporate tree gifting
              </p>

              <h1 style={{
                fontSize: 'clamp(38px, 5.5vw, 80px)',
                lineHeight: 1.03,
                marginBottom: 28,
                color: 'var(--paper)',
                fontWeight: 400,
              }}>
                Stop sending
                <br />
                gift boxes{' '}
                <span style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  color: 'var(--gold)',
                  fontWeight: 400,
                }}>they'll</span>
                <br />
                throw away.
              </h1>

              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 19,
                color: 'color-mix(in oklch, var(--paper) 78%, var(--forest))',
                lineHeight: 1.7,
                marginBottom: 16,
                maxWidth: 500,
              }}>
                Every Diwali, Indian companies spend thousands of crores on dry fruit boxes,
                branded diaries, and decorative clocks. By January, most of it is in a drawer.
                Or a dustbin.
              </p>
              <p style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 19,
                color: 'color-mix(in oklch, var(--gold) 90%, var(--paper))',
                lineHeight: 1.7,
                marginBottom: 40,
                maxWidth: 500,
              }}>
                A tree with your employee's name on it? That will still be standing
                when their grandchildren visit the farm.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#enquiry" className="btn btn-terra btn-lg">
                  Gift trees this Diwali →
                </a>
                <a href="#how-it-works" className="btn btn-ghost" style={{
                  color: 'var(--paper)',
                  borderColor: 'rgba(255,255,255,0.3)',
                }}>
                  See how it works
                </a>
              </div>
            </div>

            {/* Right: stat block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { stat: '₹8,000 Cr', label: 'spent on corporate Diwali gifts in India annually', color: 'var(--terra)' },
                { stat: '0', label: 'employees who remember a dry fruit box 6 months later', color: 'var(--terra)' },
                { stat: '100%', label: 'remember a tree with their name on it', color: 'var(--leaf)' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'oklch(0.26 0.04 150)',
                  border: '1px solid oklch(0.38 0.05 150)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  borderLeft: `4px solid ${s.color}`,
                }}>
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontSize: 'clamp(26px, 3vw, 38px)',
                    fontWeight: 500,
                    color: s.color,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    marginBottom: 8,
                  }}>
                    {s.stat}
                  </div>
                  <p style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 14,
                    color: 'color-mix(in oklch, var(--paper) 65%, var(--forest))',
                    lineHeight: 1.5,
                  }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Emotional narrative ────────────────────────────────── */}
      <section style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
        <div className="container-text">
          <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: 24 }}>
            A story worth telling
          </p>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(17px, 1.8vw, 20px)',
            lineHeight: 1.8,
            color: 'var(--ink-soft)',
            textAlign: 'center',
          }}>
            <p style={{ marginBottom: 24 }}>
              Picture Meera. She's been with your company for seven years. Accounts.
              Quiet. Never misses a deadline. Every Diwali she gets a box of cashews
              and a branded diary. She says thank you. She means it. But she doesn't
              remember the box a week later.
            </p>
            <p style={{ marginBottom: 24 }}>
              This year, she gets something different. A certificate arrives on her screen.
              A{' '}
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--forest)' }}>
                Peepal tree
              </span>{' '}
              has been planted in her name on a farm in Kheda, Gujarat. GPS: 22.7408°N, 72.6851°E.
              Her tree. Her coordinates. Her small piece of the earth.
            </p>
            <p style={{ marginBottom: 24 }}>
              On the 1st of November, she gets a photo. Her sapling, catching the first light
              of the season. She forwards it to her mother in Jaipur. Her mother calls, crying.
              "Someone planted a tree for you." In their culture, a tree is not a gift.
              A tree is a blessing.
            </p>
            <p style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(19px, 2vw, 24px)',
              color: 'var(--forest)',
              lineHeight: 1.6,
            }}>
              Three years later, Meera brings her daughter to the farm on a Saturday morning.
              She points at the bark and says: "This is yours when you grow up."
              <br /><br />
              That is what your company gave her. Not cashews.
            </p>
          </div>
        </div>
      </section>

      {/* ── Occasions ─────────────────────────────────────────── */}
      <section>
        <div className="container-narrow">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: 20 }}>
              Every occasion, one living gift
            </p>
            <h2 style={{ marginBottom: 16 }}>
              Not just Diwali.{' '}
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>
                Every time.
              </span>
            </h2>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 17,
              color: 'var(--ink-soft)',
              maxWidth: 480,
              margin: '0 auto',
              lineHeight: 1.65,
            }}>
              The best companies recognise their people across the year, not just at festival season.
              A tree works for every occasion.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}>
            {OCCASIONS.map((occ, i) => (
              <div key={i} style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: '24px 20px',
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{occ.icon}</div>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 17,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: 8,
                }}>
                  {occ.title}
                </div>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.6,
                }}>
                  {occ.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What employees get ────────────────────────────────── */}
      <section id="how-it-works" style={{ background: 'var(--forest)', color: 'var(--paper)' }}>
        <div className="container-narrow">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="eyebrow" style={{
              justifyContent: 'center',
              color: 'color-mix(in oklch, var(--leaf) 80%, var(--paper))',
              marginBottom: 20,
            }}>
              What each employee receives
            </p>
            <h2 style={{ color: 'var(--paper)', marginBottom: 16 }}>
              More than a gift.{' '}
              <span style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                color: 'var(--gold)',
                fontWeight: 400,
              }}>
                A story.
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            {WHAT_THEY_GET.map((item) => (
              <div key={item.step} style={{
                background: 'oklch(0.26 0.04 150)',
                border: '1px solid oklch(0.38 0.05 150)',
                borderRadius: 16,
                padding: '28px 24px',
              }}>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--terra)',
                  marginBottom: 14,
                }}>
                  {item.step}
                </div>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'var(--paper)',
                  marginBottom: 12,
                  lineHeight: 1.2,
                }}>
                  {item.title}
                </div>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  color: 'color-mix(in oklch, var(--paper) 65%, var(--forest))',
                  lineHeight: 1.7,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it works ──────────────────────────────────────── */}
      <section>
        <div className="container-narrow">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: 20 }}>
              The business case
            </p>
            <h2 style={{ marginBottom: 16 }}>
              Good for the planet.{' '}
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>
                Good for your people.
              </span>
            </h2>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 17,
              color: 'var(--ink-soft)',
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.65,
            }}>
              The smartest HR leaders in India are replacing transactional gifts with
              meaningful ones. Here's why tree gifting works on every level.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {WHY_IT_WORKS.map((item, i) => (
              <div key={i} style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 18,
                padding: '28px 24px',
              }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</div>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 17,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: 12,
                  lineHeight: 1.25,
                }}>
                  {item.title}
                </div>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.7,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The guilt section ─────────────────────────────────── */}
      <section style={{ background: 'color-mix(in oklch, var(--terra) 6%, var(--paper))' }}>
        <div className="container-text" style={{ textAlign: 'center' }}>
          <p className="eyebrow" style={{
            justifyContent: 'center',
            color: 'var(--terra)',
            marginBottom: 24,
          }}>
            The uncomfortable truth
          </p>
          <h2 style={{ marginBottom: 28, lineHeight: 1.1 }}>
            India is losing{' '}
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--terra)', fontWeight: 400 }}>
              14 million trees
            </span>
            {' '}every year.
          </h2>
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 18,
            color: 'var(--ink-soft)',
            lineHeight: 1.75,
            marginBottom: 24,
          }}>
            Ahmedabad hit 47°C last summer. Groundwater is depleting. The koel that
            used to announce monsoon from the neighbourhood neem — that neem is gone.
            These aren't statistics. These are the sounds and smells of a childhood
            being erased from the next generation.
          </p>
          <p style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 19,
            color: 'var(--forest)',
            lineHeight: 1.7,
            marginBottom: 32,
          }}>
            Your company will spend money on Diwali gifts regardless. The only question
            is whether that spend leaves behind something that matters — or something
            that ends up in a bin.
          </p>
          <a href="#enquiry" className="btn btn-terra btn-lg">
            Let's talk →
          </a>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section>
        <div className="container-narrow">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: 20 }}>Pricing</p>
            <h2 style={{ marginBottom: 16, fontSize: 'clamp(26px, 3vw, 42px)' }}>
              One price. Everything included.
            </h2>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 17,
              color: 'var(--ink-soft)',
              maxWidth: 440,
              margin: '0 auto',
              lineHeight: 1.65,
            }}>
              No tiers, no fine print. Every employee gets the same living gift.
            </p>
          </div>

          {/* Big price card */}
          <div style={{
            maxWidth: 560,
            margin: '0 auto',
            border: '2px solid var(--forest)',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'color-mix(in oklch, var(--forest) 4%, var(--paper))',
          }}>
            <div style={{
              background: 'var(--forest)',
              padding: '14px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--leaf)',
              }}>
                Per employee · Per tree
              </span>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'color-mix(in oklch, var(--paper) 55%, var(--forest))',
              }}>
                No minimum order
              </span>
            </div>

            <div style={{ padding: '36px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(52px, 8vw, 80px)',
                  fontWeight: 600,
                  color: 'var(--forest)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  ₹500
                </span>
                <span style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: 'var(--ink-soft)',
                }}>
                  per tree
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 15,
                color: 'var(--ink-mute)',
                marginBottom: 28,
              }}>
                Gift 1 tree or 1,000. Same price. Same quality. Same love.
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'grid', gap: 14 }}>
                {WHAT_INCLUDED.map((f, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    fontFamily: 'var(--serif)',
                    fontSize: 15,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.55,
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'color-mix(in oklch, var(--moss) 15%, var(--paper))',
                      border: '1px solid var(--moss)',
                      color: 'var(--forest)',
                      display: 'grid', placeItems: 'center',
                      fontSize: 11, flexShrink: 0, marginTop: 1,
                    }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#enquiry" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                  Gift trees now →
                </a>
                <Link href="/plant" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                  Try on website
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ───────────────────────────────────────── */}
      <section style={{ background: 'var(--paper-2)' }}>
        <div className="container-text" style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(18px, 2vw, 24px)',
            fontStyle: 'italic',
            color: 'var(--ink-soft)',
            lineHeight: 1.7,
            marginBottom: 28,
          }}>
            "We gifted trees to 320 employees last Diwali. Three months later, seven people
            had visited the farm with their families. One of them told HR it was the most
            meaningful thing the company had ever done for her. We renewed the programme
            for this year before January ended."
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '10px 20px 10px 10px',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--forest)', color: 'var(--paper)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600,
            }}>
              RK
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                Rajesh Kapoor
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                Head of HR · Ahmedabad
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How simple it is ──────────────────────────────────── */}
      <section>
        <div className="container-narrow">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: 20 }}>
              Easier than ordering a gift hamper
            </p>
            <h2 style={{ marginBottom: 16 }}>Three steps. Done.</h2>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 16,
              color: 'var(--ink-soft)',
              maxWidth: 460,
              margin: '0 auto',
              lineHeight: 1.65,
            }}>
              Everything happens directly on our website — no calls, no spreadsheets,
              no procurement forms. Gift trees to your whole team in under 10 minutes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginBottom: 40 }}>
            {[
              {
                n: '01',
                title: 'Go to Plant a Tree',
                body: 'Visit vanamitra.in/plant. Choose the occasion — Diwali, work anniversary, whatever fits — and select "gifting to multiple people." Add your colleagues\' names and emails right there on the page. Up to 10 at a time.',
                icon: '🌐',
              },
              {
                n: '02',
                title: 'Pick a species & pay',
                body: 'Choose a native species — Neem, Peepal, Mango, Banyan — one for the whole group or different for each. Pay online in one go. ₹500 per tree, one transaction, done.',
                icon: '🌳',
              },
              {
                n: '03',
                title: 'They get their tree',
                body: 'Each person receives their personalised certificate directly — by email or a shareable link you can post on your company WhatsApp group. They watch their tree grow from that day.',
                icon: '📜',
              },
            ].map((step, i) => (
              <div key={step.n} style={{
                padding: '0 32px',
                borderRight: i < 2 ? '1px dotted var(--line)' : 'none',
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{step.icon}</div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--terra)',
                  marginBottom: 10,
                }}>
                  {step.n}
                </div>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 17,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: 12,
                  lineHeight: 1.25,
                }}>
                  {step.title}
                </div>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.7,
                }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA under steps */}
          <div style={{ textAlign: 'center' }}>
            <Link href="/plant" className="btn btn-primary btn-lg">
              Plant trees now — vanamitra.in/plant →
            </Link>
            <p style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              marginTop: 14,
            }}>
              Need to gift more than 10 at once? Use the enquiry form below.
            </p>
          </div>
        </div>
      </section>

      {/* ── Enquiry form ──────────────────────────────────────── */}
      <section id="enquiry" style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)' }}>
        <div className="container-narrow">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: 72,
            alignItems: 'start',
          }}>

            {/* Left copy */}
            <div style={{ position: 'sticky', top: 100 }}>
              <p className="eyebrow" style={{ marginBottom: 20 }}>Get in touch</p>
              <h2 style={{ fontSize: 'clamp(24px, 2.8vw, 38px)', marginBottom: 20, lineHeight: 1.15 }}>
                Let's plant a tree
                {' '}
                <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                  for every person on your team.
                </span>
              </h2>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 16,
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
                marginBottom: 32,
              }}>
                Tell us the occasion, number of employees, and timeline.
                We'll come back within one business day with a personalised proposal.
                Most corporate orders are fulfilled within 5–10 working days.
              </p>

              <div style={{ display: 'grid', gap: 14, marginBottom: 32 }}>
                {[
                  ['Response time', 'Within 1 business day'],
                  ['Minimum order', '50 employees · ₹25,000'],
                  ['Fulfillment', '5–10 working days'],
                  ['Tax benefit', '80G deductible for your company'],
                  ['Farm visits', 'Every Saturday, open to all employees'],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: '1px dotted var(--line)',
                  }}>
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
                      fontSize: 13,
                      color: 'var(--ink)',
                      textAlign: 'right',
                      maxWidth: 160,
                    }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              {/* WhatsApp shortcut */}
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I'd%20like%20to%20gift%20trees%20to%20my%20employees%20through%20Vanamitra."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ display: 'inline-flex', gap: 8 }}
              >
                <span>💬</span> Or WhatsApp us directly
              </a>
            </div>

            {/* Form */}
            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: '32px 36px',
            }}>
              <CorporateForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--forest)', color: 'var(--paper)', padding: '72px 0' }}>
        <div className="container-text" style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 2vw, 26px)',
            color: 'color-mix(in oklch, var(--paper) 80%, var(--forest))',
            lineHeight: 1.7,
            marginBottom: 32,
          }}>
            "The best companies don't just pay their people. They tell them —
            through every small act — that their work means something.
            A tree is the most honest way to say it."
          </p>
          <Link href="/plant" style={{
            fontFamily: 'var(--display)',
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--leaf)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}>
            Or plant one yourself, personally →
          </Link>
        </div>
      </section>

    </div>
  )
}
