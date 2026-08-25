import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

const RESERVATION_MINUTES = 5

// POST /api/inventory/reserve
// Body: { treeId: string }
//
// Uses a single atomic Prisma updateMany with a compound WHERE clause:
//   status = FREE  OR  (status = RESERVED AND reservedUntil < now)
// If 0 rows updated → already taken by someone else → 409.
// This is race-condition-safe — no SELECT then UPDATE, no deadlocks.

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Please sign in to reserve a tree' }, { status: 401 })
    }

    const { treeId } = await req.json()
    if (!treeId) {
      return NextResponse.json({ error: 'treeId required' }, { status: 400 })
    }

    const now = new Date()
    const reservedUntil = new Date(now.getTime() + RESERVATION_MINUTES * 60 * 1000)

    // Atomic update — only succeeds if tree is FREE or its reservation expired
    const result = await prisma.inventoryTree.updateMany({
      where: {
        id: treeId,
        OR: [
          { status: 'FREE' },
          { status: 'RESERVED', reservedUntil: { lt: now } },
        ],
      },
      data: {
        status: 'RESERVED',
        reservedAt: now,
        reservedUntil,
        reservedByUserId: session.userId,
      },
    })

    if (result.count === 0) {
      // Tree was grabbed by someone else in the same instant
      return NextResponse.json(
        { error: 'This tree was just reserved by someone else. Please choose another.' },
        { status: 409 }
      )
    }

    return NextResponse.json({
      ok: true,
      reservedUntil: reservedUntil.toISOString(),
      expiresInSeconds: RESERVATION_MINUTES * 60,
    })
  } catch (err) {
    console.error('Reserve error:', err)
    return NextResponse.json({ error: 'Reservation failed' }, { status: 500 })
  }
}

// DELETE /api/inventory/reserve
// Body: { treeId: string }
// Releases a reservation early (user cancels or navigates away)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { treeId } = await req.json()

    await prisma.inventoryTree.updateMany({
      where: {
        id: treeId,
        status: 'RESERVED',
        reservedByUserId: session.userId,   // can only release your own reservation
      },
      data: {
        status: 'FREE',
        reservedAt: null,
        reservedUntil: null,
        reservedByUserId: null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Release error:', err)
    return NextResponse.json({ error: 'Release failed' }, { status: 500 })
  }
}
