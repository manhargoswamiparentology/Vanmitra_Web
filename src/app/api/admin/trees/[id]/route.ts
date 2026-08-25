import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH /api/admin/trees/[id] — update dedication status (PENDING → CONFIRMED/CANCELLED)
// id here is the Dedication id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const dedication = await prisma.dedication.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({ dedication })
  } catch (err) {
    console.error('PATCH /api/admin/trees/[id]', err)
    return NextResponse.json({ error: 'Failed to update dedication' }, { status: 500 })
  }
}
