import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slug, tag, title, excerpt, content, readTime, publishedAt } = body

    if (!slug || !tag || !title || !excerpt || !readTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for duplicate slug
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        tag,
        title,
        excerpt,
        content: content || '',
        readTime,
        authorName: session.name,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/blog', err)
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json({ posts })
  } catch (err) {
    console.error('GET /api/admin/blog', err)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}
