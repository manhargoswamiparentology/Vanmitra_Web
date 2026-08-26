import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// POST /api/admin/backfill-qr-codes
// Regenerates qrCodeData for every inventory tree whose QR code still points
// at the old hardcoded (and wrong-domain) https://vanamitra.in/tree/<id>
// value, so it resolves to wherever this app is actually running instead.
// Safe to run repeatedly — only touches rows that don't already match.
// Admin-only.

export async function POST() {
  const session = await getSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const headersList = await headers()
  const host = headersList.get('host') || 'vanamitra-seven.vercel.app'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`

  const stale = await prisma.inventoryTree.findMany({
    where: { NOT: { qrCodeData: { startsWith: baseUrl } } },
    select: { id: true, uniqueId: true },
  })

  if (stale.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, message: 'All QR codes already point here.' })
  }

  let updated = 0
  for (const tree of stale) {
    await prisma.inventoryTree.update({
      where: { id: tree.id },
      data: { qrCodeData: `${baseUrl}/tree/${tree.uniqueId}` },
    })
    updated++
  }

  return NextResponse.json({ ok: true, updated, message: `Updated QR codes for ${updated} tree(s).` })
}
