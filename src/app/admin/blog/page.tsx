import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function AdminBlogPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 28,
          gap: 16,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Admin / Blog</div>
          <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Blog Posts</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} published.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="btn btn-primary btn-sm"
          style={{ textDecoration: 'none', flexShrink: 0 }}
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-mute)', fontStyle: 'italic', marginBottom: 20 }}>
            No blog posts yet. Write your first post.
          </p>
          <Link href="/admin/blog/new" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            Write a Post
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {posts.map((post: { id: string; slug: string; tag: string; title: string; excerpt: string; readTime: string; publishedAt: Date }) => (
            <div
              key={post.id}
              className="card"
              style={{
                padding: '20px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--moss)',
                      background: 'color-mix(in oklch, var(--moss) 12%, var(--paper))',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {post.tag}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      color: 'var(--ink-mute)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {post.readTime}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--display)',
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {post.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--ink-mute)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {post.excerpt}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    color: 'var(--ink-mute)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: '2-digit',
                  })}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none' }}
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
