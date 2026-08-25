import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const notes = await prisma.note.findMany({
      where: { userId: session.userId },
      include: {
        dedication: { select: { recipientName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Reshape so frontend can use note.tree?.recipientName for backward compat
    const shaped = notes.map((n) => ({
      ...n,
      treeId: n.dedicationId,
      tree: n.dedication ? { recipientName: n.dedication.recipientName } : null,
    }))

    return NextResponse.json(shaped)
  } catch (err) {
    console.error('GET /api/notes', err)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { dedicationId, treeId, title, body: noteBody, mood } = body

    // Accept both dedicationId and legacy treeId
    const resolvedDedicationId = dedicationId || treeId || null

    if (!title || !noteBody) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
    }

    const validMoods = ['JOY', 'REFLECTION', 'ANTICIPATION']
    const noteMood = validMoods.includes(mood) ? mood : 'REFLECTION'

    if (resolvedDedicationId) {
      const dedication = await prisma.dedication.findFirst({
        where: { id: resolvedDedicationId, userId: session.userId },
      })
      if (!dedication) {
        return NextResponse.json({ error: 'Dedication not found' }, { status: 404 })
      }
    }

    const note = await prisma.note.create({
      data: {
        userId: session.userId,
        dedicationId: resolvedDedicationId,
        title,
        body: noteBody,
        mood: noteMood,
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (err) {
    console.error('POST /api/notes', err)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
