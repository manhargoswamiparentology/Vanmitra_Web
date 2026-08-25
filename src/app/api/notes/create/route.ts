import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { title?: string; body?: string; mood?: string; treeId?: string | null; dedicationId?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, body: noteBody, mood } = body
  // Accept both dedicationId and legacy treeId
  const dedicationId = body.dedicationId || body.treeId || null

  if (!title?.trim() || !noteBody?.trim()) {
    return NextResponse.json({ error: 'Title and body are required.' }, { status: 400 })
  }

  const validMoods = ['JOY', 'REFLECTION', 'ANTICIPATION']
  const noteMood = validMoods.includes(mood || '') ? (mood as 'JOY' | 'REFLECTION' | 'ANTICIPATION') : 'REFLECTION'

  if (dedicationId) {
    const dedication = await prisma.dedication.findFirst({ where: { id: dedicationId, userId: session.userId } })
    if (!dedication) return NextResponse.json({ error: 'Dedication not found.' }, { status: 404 })
  }

  const note = await prisma.note.create({
    data: {
      userId: session.userId,
      title: title.trim(),
      body: noteBody.trim(),
      mood: noteMood,
      dedicationId: dedicationId || null,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
