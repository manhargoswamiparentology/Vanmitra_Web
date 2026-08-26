import Link from 'next/link'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Blog — Vanamitra',
  description: 'Notes from the Vanamitra team on trees, dedications, and the farm.',
}

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div style={{ background: 'var(--paper)' }}>
      {/* Hero */}
      <section style={{ padding: '80px 0 60px', borderBottom: '1px solid var(--line)' }}>
        <div className="container-text" style={{ textAlign: 'center' }}>
          <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: 20 }}>
            From the team
          </p>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 80px)', marginBottom: 20 }}>
            The Vanam<span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>itra</span> Blog
          </h1>
        </div>
      </section>

      {/* Post grid */}
      <section>
        <div className="container-narrow" style={{ padding: '48px 0 80px' }}>
          {posts.length === 0 ? (
            <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-mute)', textAlign: 'center' }}>
              No posts yet — check back soon.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%' }}>
                    <div className="photo-ph" style={{ height: 140 }}>
                      <span>{post.tag}</span>
                    </div>
                    <div className="card-body">
                      <span className="tag" style={{ marginBottom: 10, display: 'inline-flex' }}>
                        {post.tag}
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3 }}>
                        {post.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'var(--serif)',
                          fontSize: 14,
                          color: 'var(--ink-soft)',
                          lineHeight: 1.6,
                          marginBottom: 14,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {post.excerpt}
                      </p>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                        {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {post.readTime}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
