import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { SPECIES } from '@/data/constants'

// GET /api/admin/reminders — allocated trees + their photo-update due date.
// Mirrors admin/reminders/page.tsx's Prisma query and its nextDueDate/
// urgency logic, computed here (not on the client) so mobile and web share
// one source of truth for the "due by the 7th of the following month" rule.

/**
 * Returns the deadline for the next photo update.
 * Rule: photos due in the first week (by the 7th) of every month.
 * Given the last event date (dedication or last update), the next
 * due date is the 7th of the following month.
 */
function nextDueDate(lastEventDate: Date): Date {
  const d = new Date(lastEventDate)
  return new Date(d.getFullYear(), d.getMonth() + 1, 7)
}

function daysFromNow(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const trees = await prisma.inventoryTree.findMany({
      where: { status: 'ALLOCATED' },
      orderBy: { addedAt: 'desc' },
      include: {
        dedication: {
          select: {
            id: true,
            createdAt: true,
            recipientName: true,
            occasionId: true,
            employeePhone: true,
            employeeEmail: true,
            user: { select: { name: true, email: true } },
          },
        },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { updates: true } },
      },
    })

    const rows = trees
      .filter((t) => t.dedication !== null)
      .map((t) => {
        const dedication = t.dedication!
        const lastUpdate = t.updates[0] ?? null
        const lastEvent = lastUpdate ? new Date(lastUpdate.createdAt) : new Date(dedication.createdAt)
        const due = nextDueDate(lastEvent)
        const days = daysFromNow(due)
        const species = SPECIES.find((s) => s.id === t.speciesId)

        let urgency: 'overdue' | 'due-soon' | 'ok'
        if (days < 0) urgency = 'overdue'
        else if (days <= 7) urgency = 'due-soon'
        else urgency = 'ok'

        return {
          treeId: t.id,
          uniqueId: t.uniqueId,
          speciesId: t.speciesId,
          speciesName: species?.name ?? t.speciesId,
          dedicationId: dedication.id,
          recipientName: dedication.recipientName,
          buyerName: dedication.user.name,
          dedicatedAt: dedication.createdAt,
          lastUpdateAt: lastUpdate?.createdAt ?? null,
          updateCount: t._count.updates,
          due,
          days,
          urgency,
        }
      })
      .sort((a, b) => a.days - b.days)

    return NextResponse.json({ rows })
  } catch (err) {
    console.error('Admin reminders GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}
