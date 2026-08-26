import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/dashboard/trees — the current user's own dedications, plus trees
// gifted to them by someone else (matched by account email against the
// dedication's recipient email, case-insensitive — mirrors the gift-matching
// query used by the web dashboard's trees/certificates/home pages, which
// today only exists as a direct Prisma query in those server components).
// Includes each tree's cover photo and recent updates so this one endpoint
// can back the mobile trees list, trees detail, and certificates screens.
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const dedications = await prisma.dedication.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { employeeEmail: { equals: session.email, mode: 'insensitive' }, status: 'CONFIRMED' },
        ],
      },
      select: {
        id: true,
        userId: true,
        recipientName: true,
        recipientFrom: true,
        message: true,
        occasionId: true,
        preferredDate: true,
        status: true,
        shareToken: true,
        createdAt: true,
        user: { select: { name: true } },
        tree: {
          select: {
            uniqueId: true,
            speciesId: true,
            plotBlock: true,
            plotRow: true,
            plotPosition: true,
            locationAddress: true,
            price: true,
            heightCm: true,
            photos: { orderBy: { takenAt: 'desc' }, take: 1, select: { url: true, caption: true } },
            updates: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, message: true, photoUrl: true, createdAt: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = dedications.map((d) => ({
      id: d.id,
      recipientName: d.recipientName,
      recipientFrom: d.recipientFrom,
      message: d.message,
      occasionId: d.occasionId,
      preferredDate: d.preferredDate,
      status: d.status,
      shareToken: d.shareToken,
      createdAt: d.createdAt,
      isGift: d.userId !== session.userId,
      giftFromName: d.userId !== session.userId ? d.user.name : null,
      tree: {
        uniqueId: d.tree.uniqueId,
        speciesId: d.tree.speciesId,
        plotBlock: d.tree.plotBlock,
        plotRow: d.tree.plotRow,
        plotPosition: d.tree.plotPosition,
        locationAddress: d.tree.locationAddress,
        price: d.tree.price,
        heightCm: d.tree.heightCm,
        coverPhotoUrl: d.tree.photos[0]?.url ?? null,
        updates: d.tree.updates,
      },
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/dashboard/trees', err)
    return NextResponse.json({ error: 'Failed to fetch trees' }, { status: 500 })
  }
}
