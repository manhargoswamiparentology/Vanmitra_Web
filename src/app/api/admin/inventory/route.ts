import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/inventory — list all inventory trees
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') // FREE | RESERVED | ALLOCATED | ALL

    const now = new Date()

    // Release expired reservations lazily
    await prisma.inventoryTree.updateMany({
      where: { status: 'RESERVED', reservedUntil: { lt: now } },
      data: { status: 'FREE', reservedAt: null, reservedUntil: null, reservedByUserId: null },
    })

    const trees = await prisma.inventoryTree.findMany({
      where: status && status !== 'ALL' ? { status: status as 'DRAFT' | 'FREE' | 'RESERVED' | 'ALLOCATED' } : {},
      include: {
        dedication: {
          include: { user: { select: { name: true, email: true } } },
        },
        reservedBy: { select: { name: true, email: true } },
        _count: { select: { photos: true, updates: true } },
      },
      orderBy: { addedAt: 'desc' },
    })

    return NextResponse.json({ trees })
  } catch (err) {
    console.error('Admin inventory GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

// POST /api/admin/inventory — add a new tree to inventory
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { speciesId, plotBlock, plotRow, plotPosition, locationAddress, gpsLat, gpsLng, price, notes, heightCm } =
      await req.json()

    if (!speciesId) {
      return NextResponse.json({ error: 'speciesId required' }, { status: 400 })
    }

    const uniqueId = `VM-${Date.now()}`
    const qrCodeData = `https://vanamitra.in/tree/${uniqueId}`

    const tree = await prisma.inventoryTree.create({
      data: {
        uniqueId,
        speciesId,
        plotBlock: plotBlock || null,
        plotRow: plotRow || null,
        plotPosition: plotPosition || null,
        locationAddress: locationAddress || null,
        gpsLat: gpsLat ? parseFloat(gpsLat) : null,
        gpsLng: gpsLng ? parseFloat(gpsLng) : null,
        price: price ? parseInt(price) : 500,
        notes: notes || null,
        heightCm: heightCm ? parseInt(heightCm) : null,
        qrCodeData,
        addedBy: session.name,
      },
    })

    return NextResponse.json({ ok: true, tree })
  } catch (err) {
    console.error('Admin inventory POST error:', err)
    return NextResponse.json({ error: 'Failed to add tree' }, { status: 500 })
  }
}
