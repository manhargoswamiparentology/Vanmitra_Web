import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/dedications — list all bookings (admin-wide, every user).
// Added for the mobile Bookings admin screen: admin/trees/page.tsx queries
// Prisma directly with no backing API route.
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') // ALL | PENDING | CONFIRMED | CANCELLED

    const dedications = await prisma.dedication.findMany({
      where: status && status !== 'ALL' ? { status: status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
        tree: { select: { uniqueId: true, speciesId: true } },
      },
    })

    return NextResponse.json({ dedications })
  } catch (err) {
    console.error('Admin dedications GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
