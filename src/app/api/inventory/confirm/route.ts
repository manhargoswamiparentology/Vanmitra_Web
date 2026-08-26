import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { randomBytes } from 'crypto'

// POST /api/inventory/confirm
// Called after "payment" — converts a RESERVED tree into ALLOCATED + creates Dedication
// Body: { treeId, occasionId, recipientName, recipientFrom?, message?, preferredDate?, employeeEmail?, employeePhone? }

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
    }

    const { treeId, occasionId, recipientName, recipientFrom, message, preferredDate, employeeEmail, employeePhone } =
      await req.json()

    if (!treeId || !occasionId || !recipientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // The recipient's certificate link is delivered to these, so both are required.
    if (!employeeEmail?.trim() || !employeePhone?.trim()) {
      return NextResponse.json(
        { error: "The recipient's email and phone are required" },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeEmail.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid recipient email address' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Verify the reservation still belongs to this user and hasn't expired
    const tree = await prisma.inventoryTree.findFirst({
      where: {
        id: treeId,
        status: 'RESERVED',
        reservedByUserId: session.userId,
        reservedUntil: { gt: now },
      },
    })

    if (!tree) {
      return NextResponse.json(
        { error: 'Your reservation has expired or is invalid. Please start again.' },
        { status: 410 }
      )
    }

    // Fetch the user to get corporate details
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isCorporate: true, companyName: true },
    })

    // Generate a unique share token for the public certificate URL
    const shareToken = randomBytes(12).toString('base64url')

    // Build location string from what we know right now
    const locationLine = tree.locationAddress
      || (tree.plotBlock
          ? `Block ${tree.plotBlock}${tree.plotRow ? `, Row ${tree.plotRow}` : ''}${tree.plotPosition ? `, Position ${tree.plotPosition}` : ''} — Vasna Village, Kheda, Gujarat`
          : 'Vasna Village, Kheda, Gujarat')

    const gpsLine = (tree.gpsLat != null && tree.gpsLng != null)
      ? ` · GPS: ${tree.gpsLat.toFixed(6)}, ${tree.gpsLng.toFixed(6)}`
      : ''

    // Atomically mark tree ALLOCATED and create Dedication in a transaction
    const { dedication, autoUpdate } = await prisma.$transaction(async (tx) => {
      await tx.inventoryTree.update({
        where: { id: treeId },
        data: {
          status: 'ALLOCATED',
          reservedAt: null,
          reservedUntil: null,
          reservedByUserId: null,
        },
      })

      const ded = await tx.dedication.create({
        data: {
          treeId,
          userId: session.userId,
          occasionId,
          recipientName,
          recipientFrom: recipientFrom || null,
          message: message || null,
          status: 'CONFIRMED',
          shareToken,
          corporateName: user?.isCorporate ? (user.companyName || null) : null,
          employeeEmail: employeeEmail || null,
          employeePhone: employeePhone || null,
        },
      })

      // Automatic confirmation message with full tree details
      const msg1 = await tx.treeUpdate.create({
        data: {
          treeId,
          message: `🌱 Your dedication for ${recipientName} is confirmed! Tree ${tree.uniqueId} has been allocated to them at ${locationLine}${gpsLine}. Your shareable certificate is ready — share it with ${recipientName} from your dashboard. — Vanamitra Team`,
          createdBy: 'Vanamitra',
        },
      })

      return { dedication: ded, autoUpdate: msg1 }
    })

    return NextResponse.json({ ok: true, dedicationId: dedication.id, shareToken })
  } catch (err) {
    console.error('Confirm error:', err)
    return NextResponse.json({ error: 'Could not confirm dedication' }, { status: 500 })
  }
}
