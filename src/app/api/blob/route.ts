import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { getSession } from '@/lib/auth'

const token =
  process.env.BLOB_READ_WRITE_TOKEN ||
  process.env.BLOB_V_READ_WRITE_TOKEN ||
  ''

// GET /api/blob?url=<encoded-blob-url>
// Proxies a private Vercel Blob file to authenticated users.
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const url = request.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url param', { status: 400 })

  const result = await get(url, { token })

  if (!result || result.statusCode !== 200) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'image/jpeg',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
