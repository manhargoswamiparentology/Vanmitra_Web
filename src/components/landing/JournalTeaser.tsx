import Link from 'next/link'
import Image from 'next/image'
import { BLOG_POSTS } from '@/data/constants'

export default function JournalTeaser() {
  const [feature, second, third] = BLOG_POSTS

  return (
    <section>
      <div className="container">
        {/* Section header */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '40px',
          borderBottom: '1px dotted var(--line)',
          paddingBottom: '20px',
        }}>
          <h3 style={{ fontSize: 'clamp(20px, 2vw, 26px)' }}>From the journal</h3>
          <Link
            href="/journal"
            className="mono-sm"
            style={{ color: 'var(--moss)', textDecoration: 'none', letterSpacing: '0.08em' }}
          >
            Read all entries →
          </Link>
        </div>

        {/* 3-col grid: feature (col-span-2) + right stack */}
        <div className="journal-grid">

          {/* Feature post */}
          <Link
            href={`/journal/${feature.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
                <Image
                  src={`/images/journal/${feature.id}.png`}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="card-body">
                <span className="tag" style={{ marginBottom: '14px', display: 'inline-flex' }}>{feature.tag}</span>
                <h3 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', marginBottom: '12px', lineHeight: 1.25 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: '16px' }}>
                  {feature.excerpt}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                }}>
                  <span className="mono-sm">{feature.date}</span>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--line)', display: 'block' }} />
                  <span className="mono-sm">{feature.read} read</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Right column — two smaller cards stacked */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {[second, third].map((post) => (
              <Link
                key={post.id}
                href={`/journal/${post.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '16/7', position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={`/images/journal/${post.id}.png`}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 35vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="card-body">
                    <span className="tag" style={{ marginBottom: '10px', display: 'inline-flex', fontSize: '10px' }}>{post.tag}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', lineHeight: 1.3 }}>
                      {post.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '12px' }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className="mono-sm" style={{ fontSize: '10px' }}>{post.date}</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--line)', display: 'block' }} />
                      <span className="mono-sm" style={{ fontSize: '10px' }}>{post.read} read</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
