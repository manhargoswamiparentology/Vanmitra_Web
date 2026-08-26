import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({ where: { slug } })
  if (!post) notFound()

  // Content is a plain textarea in the admin form — treat blank lines as
  // paragraph breaks, falling back to single line breaks if there aren't any.
  const bodyParagraphs = (
    post.content.trim().split(/\n\s*\n/).length > 1
      ? post.content.trim().split(/\n\s*\n/)
      : post.content.trim().split('\n')
  ).filter((p) => p.trim().length > 0)

  const otherPosts = await prisma.blogPost.findMany({
    where: { slug: { not: slug } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })

  const dateLabel = new Date(post.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div style={{ background: 'var(--paper)' }}>
      {/* Back + header */}
      <section style={{ padding: '48px 0 0' }}>
        <div className="container-text">
          <Link
            href="/blog"
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
            ← All posts
          </Link>

          <span className="tag" style={{ marginBottom: 16, display: 'inline-flex' }}>
            {post.tag}
          </span>

          <h1 style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.1, marginBottom: 24 }}>
            {post.title}
          </h1>

          <p className="mono" style={{ color: 'var(--ink-mute)', marginBottom: 40 }}>
            {post.authorName} · {dateLabel} · {post.readTime}
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="container-text" style={{ paddingBottom: 80 }}>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 19,
            lineHeight: 1.7,
            color: 'var(--ink)',
            borderLeft: '3px solid var(--terra)',
            paddingLeft: 20,
            marginBottom: 36,
          }}
        >
          {post.excerpt}
        </p>

        <div style={{ display: 'grid', gap: 24 }}>
          {bodyParagraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 17,
                lineHeight: 1.75,
                color: 'var(--ink-soft)',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        <hr className="dotted-rule" />

        {/* Author note */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            padding: '20px 24px',
            background: 'var(--paper-2)',
            borderRadius: 12,
          }}
        >
          <div
            style={{
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
            }}
          >
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
              {post.authorName}
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.55 }}>
              Written from Vasna village, Kheda district, Gujarat.
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
              {otherPosts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%' }}>
                    <div className="photo-ph" style={{ height: 140 }}>
                      <span>{p.tag}</span>
                    </div>
                    <div className="card-body">
                      <span className="tag" style={{ marginBottom: 10, display: 'inline-flex' }}>
                        {p.tag}
                      </span>
                      <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3 }}>
                        {p.title}
                      </h3>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                        {new Date(p.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {p.readTime}
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
