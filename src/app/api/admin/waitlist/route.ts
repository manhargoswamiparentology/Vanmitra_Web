import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/waitlist — list all waitlist signups
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const entries = await prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ entries })
  } catch (err) {
    console.error('Admin waitlist GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 })
  }
}
