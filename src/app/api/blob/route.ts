import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  process.env.BLOB_V_READ_WRITE_TOKEN ||
  ''

// GET /api/blob?url=<encoded-blob-url>
// Server-side proxy for private Vercel Blob files.
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const url = request.nextUrl.searchParams.get('url')
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return new NextResponse('Invalid url', { status: 400 })
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${blobToken}` },
    // forward cache headers from the browser so conditional GETs work
    ...(request.headers.get('if-none-match')
      ? { headers: { Authorization: `Bearer ${blobToken}`, 'If-None-Match': request.headers.get('if-none-match')! } }
      : {}),
  })

  if (res.status === 304) {
    return new NextResponse(null, { status: 304 })
  }

  if (!res.ok) {
    console.error(`[blob proxy] ${res.status} for ${url}`)
    return new NextResponse(`Blob error ${res.status}`, { status: res.status })
  }

  return new NextResponse(res.body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'private, max-age=3600',
      ...(res.headers.get('ETag') ? { ETag: res.headers.get('ETag')! } : {}),
    },
  })
}
