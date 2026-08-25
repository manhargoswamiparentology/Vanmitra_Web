import { BLOG_POSTS } from '@/data/constants'
import TagFilter from './TagFilter'

export const metadata = {
  title: 'The Vanamitra Journal — Trees, science, and stories from the farm',
  description: 'Dispatches from the Kheda farm — how we plant, why it matters, and the people behind the trees.',
}

export default function JournalPage() {
  return (
    <div style={{ background: 'var(--paper)' }}>
      {/* Hero */}
      <section style={{ padding: '80px 0 60px', borderBottom: '1px solid var(--line)' }}>
        <div className="container-text" style={{ textAlign: 'center' }}>
          <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: 20 }}>
            From the farm
          </p>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 80px)', marginBottom: 20 }}>
            The Vanam<span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>itra</span> Journal
          </h1>
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 18,
            color: 'var(--ink-soft)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto',
          }}>
            Dispatches from Vasna village — the science of native trees, the stories of dedications,
            and what our team sees walking the rows every morning at six.
          </p>
        </div>
      </section>

      {/* Posts with tag filter */}
      <section>
        <div className="container-narrow">
          <TagFilter posts={BLOG_POSTS} />
        </div>
      </section>
    </div>
  )
}
