import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { getSession } from '@/lib/auth'

// vanamitra-media store token (matches what Vercel connects via BLOB_V_READ_WRITE_TOKEN)
const blobToken = process.env.BLOB_V_READ_WRITE_TOKEN || ''

// GET /api/blob?url=<encoded-blob-url>
// Server-side proxy for private Vercel Blob files (vanamitra-media store).
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const url = request.nextUrl.searchParams.get('url')
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return new NextResponse('Invalid url', { status: 400 })
  }

  // Extract pathname from the stored URL so get() uses the correct store from the token
  let pathname: string
  try {
    pathname = new URL(url).pathname.slice(1)
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  const result = await get(pathname, {
    access: 'private',
    token: blobToken,
  })

  if (result === null) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (result.statusCode !== 200) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'image/jpeg',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
