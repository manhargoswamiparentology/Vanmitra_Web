import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/trees — returns user's dedications in a simplified shape
// Used by the Notes page for the dedication dropdown
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dedications = await prisma.dedication.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        recipientName: true,
        occasionId: true,
        status: true,
        tree: { select: { speciesId: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Return shape the notes page expects: { id, recipientName, speciesId, status }
    const result = dedications.map((d) => ({
      id: d.id,
      recipientName: d.recipientName,
      speciesId: d.tree.speciesId,
      status: d.status,
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/trees', err)
    return NextResponse.json({ error: 'Failed to fetch dedications' }, { status: 500 })
  }
}
