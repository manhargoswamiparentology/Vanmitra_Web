import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/inventory/available?species=mango
// Returns trees that are FREE or whose reservation has expired.
// Expired reservations are released lazily here — no cron needed.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const speciesId = searchParams.get('species') || undefined

    const now = new Date()

    // Release any expired reservations atomically first
    await prisma.inventoryTree.updateMany({
      where: {
        status: 'RESERVED',
        reservedUntil: { lt: now },
      },
      data: {
        status: 'FREE',
        reservedAt: null,
        reservedUntil: null,
        reservedByUserId: null,
      },
    })

    const trees = await prisma.inventoryTree.findMany({
      where: {
        status: 'FREE',
        ...(speciesId ? { speciesId } : {}),
      },
      select: {
        id: true,
        uniqueId: true,
        speciesId: true,
        plotBlock: true,
        plotRow: true,
        plotPosition: true,
        locationAddress: true,
        gpsLat: true,
        gpsLng: true,
        price: true,
        healthStatus: true,
        heightCm: true,
      },
      orderBy: { addedAt: 'asc' },
    })

    return NextResponse.json({ trees, total: trees.length })
  } catch (err) {
    console.error('Available trees error:', err)
    return NextResponse.json({ error: 'Failed to fetch available trees' }, { status: 500 })
  }
}
