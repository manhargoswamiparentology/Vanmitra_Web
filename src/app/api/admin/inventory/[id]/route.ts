import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/inventory/[id] — single tree, with full photos/updates
// (the list route only carries _count for those, same as the web list
// page — this mirrors the web detail page's own separate findUnique).
// Added for the mobile Inventory detail screen.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    const tree = await prisma.inventoryTree.findUnique({
      where: { id },
      include: {
        dedication: { include: { user: { select: { name: true, email: true } } } },
        reservedBy: { select: { name: true, email: true } },
        photos: { orderBy: { takenAt: 'desc' } },
        updates: { orderBy: { createdAt: 'desc' } },
        _count: { select: { photos: true, updates: true } },
      },
    })

    if (!tree) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ tree })
  } catch (err) {
    console.error('Admin inventory detail GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch tree' }, { status: 500 })
  }
}

// PATCH /api/admin/inventory/[id] — update tree details & price
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await req.json()

    // Only allow admin-controllable status transitions: DRAFT ↔ FREE
    // RESERVED and ALLOCATED are managed by the booking flow, not manual edits
    const allowedStatusTransitions = ['DRAFT', 'FREE']

    const tree = await prisma.inventoryTree.update({
      where: { id },
      data: {
        ...(body.speciesId !== undefined && { speciesId: body.speciesId }),
        ...(body.plotBlock !== undefined && { plotBlock: body.plotBlock }),
        ...(body.plotRow !== undefined && { plotRow: body.plotRow }),
        ...(body.plotPosition !== undefined && { plotPosition: body.plotPosition }),
        ...(body.locationAddress !== undefined && { locationAddress: body.locationAddress }),
        ...(body.gpsLat !== undefined && { gpsLat: body.gpsLat ? parseFloat(body.gpsLat) : null }),
        ...(body.gpsLng !== undefined && { gpsLng: body.gpsLng ? parseFloat(body.gpsLng) : null }),
        ...(body.price !== undefined && { price: parseInt(body.price) }),
        ...(body.healthStatus !== undefined && { healthStatus: body.healthStatus }),
        ...(body.heightCm !== undefined && { heightCm: body.heightCm ? parseInt(body.heightCm) : null }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status !== undefined && allowedStatusTransitions.includes(body.status) && { status: body.status }),
      },
    })

    return NextResponse.json({ ok: true, tree })
  } catch (err) {
    console.error('Admin inventory PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update tree' }, { status: 500 })
  }
}

// DELETE /api/admin/inventory/[id] — remove a FREE tree from inventory
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    const tree = await prisma.inventoryTree.findUnique({ where: { id } })
    if (!tree) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (tree.status === 'RESERVED' || tree.status === 'ALLOCATED') {
      return NextResponse.json({ error: 'Cannot delete a reserved or allocated tree' }, { status: 409 })
    }

    await prisma.inventoryTree.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Admin inventory DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete tree' }, { status: 500 })
  }
}
