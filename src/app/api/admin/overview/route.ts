import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/overview — the admin home screen's stat cards + recent
// activity feed. Mirrors admin/page.tsx's Prisma queries. Computed here
// rather than derived client-side from the other admin list routes —
// deriving "5 most recent updates across every tree" from the other
// endpoints would mean over-fetching the entire inventory/dedications
// list just to compute a handful of counts.
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalBookings, totalInventory, freeInventory, allocatedInventory, totalUsers, recentUpdates, dedicationsThisMonth] =
      await Promise.all([
        prisma.dedication.count({ where: { status: 'CONFIRMED' } }),
        prisma.inventoryTree.count(),
        prisma.inventoryTree.count({ where: { status: 'FREE' } }),
        prisma.inventoryTree.count({ where: { status: 'ALLOCATED' } }),
        prisma.user.count(),
        prisma.treeUpdate.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            tree: {
              include: {
                dedication: { select: { id: true, recipientName: true } },
              },
            },
          },
        }),
        prisma.dedication.count({ where: { createdAt: { gte: startOfMonth } } }),
      ])

    return NextResponse.json({
      stats: { totalBookings, totalInventory, freeInventory, allocatedInventory, totalUsers, dedicationsThisMonth },
      recentUpdates: recentUpdates.map((u) => ({
        id: u.id,
        message: u.message,
        createdAt: u.createdAt,
        treeUniqueId: u.tree.uniqueId,
        dedicationId: u.tree.dedication?.id ?? null,
        recipientName: u.tree.dedication?.recipientName ?? null,
      })),
    })
  } catch (err) {
    console.error('Admin overview GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 })
  }
}
