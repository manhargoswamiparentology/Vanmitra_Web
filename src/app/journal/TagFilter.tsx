'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BLOG_POSTS } from '@/data/constants'

type Post = typeof BLOG_POSTS[number]

interface Props {
  posts: Post[]
}

export default function TagFilter({ posts }: Props) {
  const allTags = Array.from(new Set(posts.map(p => p.tag)))
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = activeTag ? posts.filter(p => p.tag === activeTag) : posts
  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div>
      {/* Tag pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
        <button
          onClick={() => setActiveTag(null)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '7px 14px',
            borderRadius: 999,
            border: activeTag === null ? '1px solid var(--forest)' : '1px solid var(--line)',
            background: activeTag === null ? 'var(--forest)' : 'transparent',
            color: activeTag === null ? 'var(--paper)' : 'var(--ink-mute)',
            cursor: 'pointer',
            transition: 'all 160ms',
          }}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '7px 14px',
              borderRadius: 999,
              border: activeTag === tag ? '1px solid var(--forest)' : '1px solid var(--line)',
              background: activeTag === tag ? 'var(--forest)' : 'transparent',
              color: activeTag === tag ? 'var(--paper)' : 'var(--ink-mute)',
              cursor: 'pointer',
              transition: 'all 160ms',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Featured post */}
      {featured && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
          border: '1px solid var(--line)',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 48,
        }}>
          <div style={{ minHeight: 300, position: 'relative', overflow: 'hidden' }}>
            <Image
              src={`/images/journal/${featured.id}.png`}
              alt={featured.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="tag" style={{ marginBottom: 16, alignSelf: 'flex-start' }}>
              {featured.tag}
            </span>
            <h2 style={{
              fontSize: 'clamp(20px, 2vw, 30px)',
              marginBottom: 14,
              lineHeight: 1.2,
            }}>
              {featured.title}
            </h2>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 16,
              color: 'var(--ink-soft)',
              lineHeight: 1.65,
              marginBottom: 24,
            }}>
              {featured.excerpt}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink-mute)',
              }}>
                {featured.date} · {featured.read} read
              </span>
            </div>
            <Link
              href={`/journal/${featured.id}`}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              Read →
            </Link>
          </div>
        </div>
      )}

      {/* Post grid */}
      {rest.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}>
          {rest.map(post => (
            <Link key={post.id} href={`/journal/${post.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%' }}>
                <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src={`/images/journal/${post.id}.png`}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body">
                  <span className="tag" style={{ marginBottom: 12, display: 'inline-flex' }}>
                    {post.tag}
                  </span>
                  <h3 style={{
                    fontSize: 17,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}>
                    {post.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 14,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.6,
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.excerpt}
                  </p>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-mute)',
                  }}>
                    {post.date} · {post.read} read
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
