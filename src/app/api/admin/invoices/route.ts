import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/invoices — dedications list + revenue summary.
// Mirrors admin/invoices/page.tsx's query and its inline summary math,
// computed here so mobile doesn't duplicate the aggregation logic.
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const dedications = await prisma.dedication.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        status: true,
        occasionId: true,
        recipientName: true,
        corporateName: true,
        employeeEmail: true,
        user: { select: { name: true, email: true } },
        tree: { select: { uniqueId: true, speciesId: true, price: true } },
      },
    })

    const confirmed = dedications.filter((d) => d.status === 'CONFIRMED')
    const totalRevenue = confirmed.reduce((sum, d) => sum + (d.tree.price ?? 500), 0)
    const now = new Date()
    const thisMonthRevenue = confirmed
      .filter((d) => {
        const created = new Date(d.createdAt)
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      })
      .reduce((sum, d) => sum + (d.tree.price ?? 500), 0)

    const summary = {
      totalRevenue,
      thisMonthRevenue,
      totalOrders: dedications.length,
      confirmedCount: confirmed.length,
      pendingCount: dedications.filter((d) => d.status === 'PENDING').length,
      cancelledCount: dedications.filter((d) => d.status === 'CANCELLED').length,
      avgOrderValue: confirmed.length ? Math.round(totalRevenue / confirmed.length) : null,
    }

    return NextResponse.json({ dedications, summary })
  } catch (err) {
    console.error('Admin invoices GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}
