import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/trees/[id] — returns a single dedication by id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dedication = await prisma.dedication.findUnique({
      where: { id },
      select: {
        id: true,
        recipientName: true,
        recipientFrom: true,
        message: true,
        occasionId: true,
        preferredDate: true,
        status: true,
        shareToken: true,
        tree: {
          select: {
            speciesId: true,
            plotBlock: true,
            uniqueId: true,
            price: true,
          },
        },
      },
    })

    if (!dedication) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(dedication)
  } catch (err) {
    console.error('GET /api/trees/[id]', err)
    return NextResponse.json({ error: 'Failed to fetch dedication' }, { status: 500 })
  }
}
