import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const blobToken = process.env.BLOB_V_READ_WRITE_TOKEN || ''

// GET /api/blob?url=<encoded-blob-url>
// Serves private Vercel Blob files (vanamitra-media store) to authenticated users.
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const url = request.nextUrl.searchParams.get('url')
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return new NextResponse('Invalid url', { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${blobToken}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error(`[blob proxy] ${res.status} fetching ${url}`)
      return new NextResponse(`Blob error`, { status: res.status })
    }

    return new NextResponse(res.body, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[blob proxy] fetch threw:', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}
