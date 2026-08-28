import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/users — list all registered users with their booking count
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Explicit `select` (not `include`) — this response is serialized
    // straight to JSON, unlike the web page's server component where the
    // same Prisma call never leaves the server. Must not pull passwordHash.
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { dedications: true } },
      },
    })

    return NextResponse.json({ users })
  } catch (err) {
    console.error('Admin users GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
