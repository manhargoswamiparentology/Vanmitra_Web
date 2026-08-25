'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewBlogPostPage() {
  const router = useRouter()

  const [slug, setSlug] = useState('')
  const [tag, setTag] = useState('')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [readTime, setReadTime] = useState('')
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generate slug from title
  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value))
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          tag,
          title,
          excerpt,
          content,
          readTime,
          publishedAt: new Date(publishedAt).toISOString(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create post')
      }
      router.push('/admin/blog')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 28,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
        }}
      >
        <Link href="/admin/blog" style={{ color: 'var(--forest)', textDecoration: 'none' }}>
          Blog Posts
        </Link>
        <span>/</span>
        <span>New Post</span>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Admin / Blog</div>
        <h2 style={{ fontSize: 28, fontWeight: 500 }}>New Blog Post</h2>
      </div>

      <div className="card" style={{ padding: '28px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Title</label>
              <input
                type="text"
                placeholder="My blog post title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Slug</label>
              <input
                type="text"
                placeholder="my-blog-post-title"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Tag / Category</label>
              <input
                type="text"
                placeholder="Nature"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Read Time</label>
              <input
                type="text"
                placeholder="4 min read"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Published Date</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Excerpt</label>
            <textarea
              placeholder="A short summary shown in listings and previews…"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              required
              style={{ minHeight: 70 }}
            />
          </div>

          <div className="field">
            <label>Content</label>
            <textarea
              placeholder="Write the full blog post content here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              required
              style={{ minHeight: 320, fontFamily: 'var(--serif)', lineHeight: 1.7 }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'color-mix(in oklch, var(--terra) 12%, var(--paper))',
                color: 'var(--terra-deep)',
                border: '1px solid color-mix(in oklch, var(--terra) 30%, transparent)',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Publishing…' : 'Publish Post'}
            </button>
            <Link
              href="/admin/blog"
              className="btn btn-ghost btn-sm"
              style={{ textDecoration: 'none' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
