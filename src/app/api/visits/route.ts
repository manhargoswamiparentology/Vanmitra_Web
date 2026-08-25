import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// POST /api/visits — log a farm visit
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  try {
    const { visitDate, duration, companions, note } = await req.json()

    if (!visitDate) {
      return NextResponse.json({ error: 'Visit date is required.' }, { status: 400 })
    }

    const visit = await prisma.visit.create({
      data: {
        userId: session.userId,
        visitDate: new Date(visitDate),
        duration: duration?.trim() || null,
        companions: companions?.trim() || null,
        note: note?.trim() || null,
      },
    })

    return NextResponse.json({ ok: true, visit })
  } catch (err) {
    console.error('Visit log error:', err)
    return NextResponse.json({ error: 'Could not save visit.' }, { status: 500 })
  }
}
