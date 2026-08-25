import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_POSTS } from '@/data/constants'

interface Props {
  params: Promise<{ slug: string }>
}

const BODY_CONTENT: Record<string, string[]> = {
  'where-donation-goes': [
    'When you pay ₹500, the first thing that moves is a purchase order to our nursery partner in Nadiad. A certified sapling — grown from seeds native to the Sabarmati basin — costs us between ₹80 and ₹120, depending on species and age. Neem tends to be cheaper; Peepal and Arjun are slightly more because they require longer nursery time. The sapling arrives on a Tuesday or Saturday morning, tagged with a temporary number.',
    'Labour is the second largest cost. Our team of thirteen plants in pairs. Each pair plants between 18 and 24 trees in a session, clearing the pit, mixing compost, setting the tree guard, and recording the GPS coordinates. This work costs us ₹9 per sapling in direct wages plus a small materials overhead. We do not use daily contract labour for planting; our permanent team does it, which is why our survival rates hold.',
    'The remaining ₹312 — the largest share — goes toward what happens after: three years of mulching (twice per monsoon), drip-irrigation infrastructure, monthly photography, the QR-tagged marker, and the digital platform that hosts your tree page and certificate. A tree does not survive by being planted; it survives because someone comes back. That cost is real, and it is baked into every ₹500.',
  ],
  'matters-2026': [
    "Gujarat's forest cover declined by 2.1% between 2015 and 2023, according to the Forest Survey of India. That number sounds small until you convert it: roughly 58,000 hectares, gone. The causes are the familiar ones — agricultural expansion, construction on the urban fringe, and climate-accelerated die-off of trees already under stress. The kharif cropping belt around Kheda has lost almost its entire tree cover in one generation.",
    'A single mature native tree absorbs between 20 and 28 kg of CO₂ per year, provides microclimate cooling of up to 2°C within a 15-metre radius, and recharges groundwater at a rate of roughly 400 litres per monsoon through its root channels. These are not metaphors. They are measurements, and they compound. One thousand trees across 10 acres does not equal one thousand times the effect of one tree — it equals more, because trees in proximity create systems.',
    'We are not planting a symbolic forest. We are planting a functional one — species chosen for the specific soil type and rainfall pattern of the Kheda district, maintained over years, and monitored for outcomes. The ₹500 you pay is not a donation that disappears into overhead. It buys a specific sapling, planted by a specific person, on a specific day, and tracked until it is taller than you are.',
  ],
  'native-vs-non': [
    'The distinction between a native and non-native tree sounds academic until you watch what happens in the soil. Native trees — those that evolved in the Sabarmati basin over thousands of years — carry relationships with local mycorrhizal fungi, specific insect pollinators, and the birds that disperse their seeds. When you plant a native Peepal or Neem, you are not inserting a single organism into the ground. You are reactivating a web of dependencies that the land already knows how to sustain.',
    'Non-native species, by contrast, are often planted for speed. Eucalyptus grows quickly and sequesters carbon fast — which sounds ideal until you learn that it depletes groundwater at roughly three times the rate of a native tree, supports almost no local wildlife, and produces allelopathic compounds that prevent other plants from establishing nearby. We have removed every eucalyptus from the Vanamitra plot. The Gulmohar — not native to India but naturalised here for over a century — is the careful exception we make, and only in limited numbers.',
    'Eighty-seven percent of what we plant is native: Neem, Peepal, Banyan, Arjun, Mango, and Drumstick. These species have evolved to handle our soil chemistry, our monsoon intensity, and our dry-season temperatures. They do not require supplemental irrigation after year three. They build canopy that other species can grow under. They make the farm, over time, capable of sustaining itself without us.',
  ],
  'survival': [
    'A tree dies for one of four reasons in the first three years: inadequate watering during the first dry season, competition from invasive grass species, pest infestation at the root zone, or physical damage from animals or vehicles. Our 94% survival rate is built around removing each of these risks systematically, not heroically. There is nothing clever about it. It is boring, consistent work done on a schedule.',
    'In the first monsoon, we mulch each tree with a 10-cm layer of dry biomass — typically composted coir and leaf litter — to suppress grass competition and retain moisture. After the rains, we install a drip line at the root zone for the dry season. Our team walks every row twice a week in the summer, checking soil moisture and looking for signs of stress. When a tree wilts, we respond within 24 hours.',
    'Tree guards are non-negotiable. We use cylindrical wire mesh, 90 cm tall and 60 cm in diameter, staked to a bamboo pole. This prevents damage from nilgai, rabbits, and the occasional errant tractor. We remove the guard when the trunk diameter reaches 5 cm, which typically happens in year two or three, depending on species. None of this is expensive. It is, collectively, the reason trees survive.',
  ],
  'community': [
    "Karsanbhai Patel has been walking these rows since before there was a Vanamitra. He grew up in Vasna village, 400 metres from where our farm begins. His family has farmed this district for three generations, and he knows the land's character in a way that no amount of soil testing can replicate. When we were choosing which blocks to prioritise for our first plantings, it was Karsanbhai who pointed us toward the northeast corner — where the groundwater sits two metres higher and the soil clay content is just right for Peepal. He was correct.",
    'Rinaben Solanki is our field photographer. Every first of the month, she walks each dedicated tree with a calibrated phone camera and a measuring rod, documents the trunk girth, canopy spread, and any pest activity, and uploads the photos through our admin portal. She learned to do this in two days, having never used a smartphone before. She now trains the new team members. Her photos are why dedicators in Mumbai and Bengaluru stay emotionally connected to a tree they may not have visited yet.',
    'The full team of thirteen includes three women, two of whom were previously agricultural day labourers with no fixed employer. Vanamitra pays above the district minimum wage, provides a monthly health allowance, and has a written grievance process — which none of them have needed to use, but which exists. The work is physical and repetitive and matters. We think that is worth saying plainly.',
  ],
  'gift-that-grows': [
    'Consider the physics of a conventional gift. A scented candle burns for forty hours and is gone. A box of sweets lasts a week. A piece of clothing has a median lifespan of two years in active rotation. Each of these objects was manufactured, shipped, purchased, and given — and then the world contains slightly more entropy and slightly less of whatever material made it. This is not an argument against gifts. It is an observation about what most gifts do.',
    'A tree inverts this. On the day of planting, it is at its smallest and most fragile. In year two, it is larger and more resilient. By year ten, it is providing shade, cooling the air, housing insects, and pulling carbon from the atmosphere. By year fifty — long after the person who planted it and the person it was planted for are gone — it is doing all of this at ten times the scale. The gift grows. This is unusual.',
    'We have received dedications for birthdays, for births, for deaths, for retirements, for apologies, for gratitude, and for no stated reason at all. What strikes us, reading the messages dedicators leave, is how often they describe the tree as a substitute for the things language cannot hold. "I did not know what else to do," one message read. "So I planted something." This is, we think, exactly right. Sometimes the most honest thing you can give is something that does not try to say what it means — and simply grows.',
  ],
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = BLOG_POSTS.find(p => p.id === slug)
  if (!post) notFound()

  const bodyParagraphs = BODY_CONTENT[post.id] || [
    `${post.title} is a subject we think about constantly at the Vanamitra farm. The intersection of ecological science and human intention — the question of what it means to plant something for someone — sits at the center of everything we do.`,
    `On our ten acres in Vasna village, we have learned that the most important things happen slowly. A seed germinates. Roots extend through clay. The first leaves unfold. None of this is dramatic, and all of it is irreversible. By the time a tree is tall enough to shade a person standing beneath it, something permanent has been added to the world.`,
    `We write these journal entries to share what we learn — from the soil, from the team, and from the people who choose to plant here. If you have questions, or if something in this piece prompted a thought, write to us. We read every message.`,
  ]

  const otherPosts = BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 3)

  return (
    <div style={{ background: 'var(--paper)' }}>

      {/* Back + header */}
      <section style={{ padding: '48px 0 0' }}>
        <div className="container-text">
          <Link
            href="/journal"
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 36,
            }}
          >
            ← All entries
          </Link>

          <span className="tag" style={{ marginBottom: 16, display: 'inline-flex' }}>
            {post.tag}
          </span>

          <h1 style={{
            fontSize: 'clamp(30px, 4vw, 52px)',
            lineHeight: 1.1,
            marginBottom: 24,
          }}>
            {post.title}
          </h1>

          <p className="mono" style={{ color: 'var(--ink-mute)', marginBottom: 40 }}>
            Vanamitra Team · {post.date} · {post.read} read
          </p>
        </div>
      </section>

      {/* Hero photo */}
      <div className="container-narrow" style={{ marginBottom: 56 }}>
        <div className="photo-ph" style={{
          aspectRatio: '16 / 9',
          borderRadius: 16,
          minHeight: 200,
        }}>
          <span>{post.tag} · {post.title.split(' ').slice(0, 4).join(' ')}…</span>
        </div>
      </div>

      {/* Body */}
      <div className="container-text" style={{ paddingBottom: 80 }}>
        {/* Intro — italic with terra border */}
        <p style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 19,
          lineHeight: 1.7,
          color: 'var(--ink)',
          borderLeft: '3px solid var(--terra)',
          paddingLeft: 20,
          marginBottom: 36,
        }}>
          {post.excerpt}
        </p>

        {/* Body paragraphs */}
        <div style={{ display: 'grid', gap: 24 }}>
          {bodyParagraphs.map((para, i) => (
            <p key={i} style={{
              fontFamily: 'var(--serif)',
              fontSize: 17,
              lineHeight: 1.75,
              color: 'var(--ink-soft)',
            }}>
              {para}
            </p>
          ))}
        </div>

        <hr className="dotted-rule" />

        {/* Author note */}
        <div style={{
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
          padding: '20px 24px',
          background: 'var(--paper-2)',
          borderRadius: 12,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--forest)',
            color: 'var(--paper)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--display)',
            fontSize: 18,
            fontWeight: 500,
            flexShrink: 0,
          }}>
            V
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--display)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 4,
            }}>
              Vanamitra Team
            </div>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 14,
              color: 'var(--ink-mute)',
              lineHeight: 1.55,
            }}>
              Written from Vasna village, Kheda district, Gujarat. We plant on Tuesdays and Saturdays.
            </p>
          </div>
        </div>
      </div>

      {/* Keep reading */}
      {otherPosts.length > 0 && (
        <section style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)' }}>
          <div className="container-narrow">
            <p className="eyebrow" style={{ marginBottom: 24 }}>
              Keep reading
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {otherPosts.map(p => (
                <Link key={p.id} href={`/journal/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%' }}>
                    <div className="photo-ph" style={{ height: 140 }}>
                      <span>{p.tag}</span>
                    </div>
                    <div className="card-body">
                      <span className="tag" style={{ marginBottom: 10, display: 'inline-flex' }}>
                        {p.tag}
                      </span>
                      <h3 style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: 'var(--ink)',
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}>
                        {p.title}
                      </h3>
                      <div style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-mute)',
                      }}>
                        {p.date} · {p.read}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
