import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { randomBytes } from 'crypto'

// POST /api/admin/backfill-tokens
// Generates shareToken for all dedications that don't have one yet.
// Admin-only.

export async function POST() {
  const session = await getSession()
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Find all dedications without a shareToken
  const missing = await prisma.dedication.findMany({
    where: { shareToken: null },
    select: { id: true },
  })

  if (missing.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, message: 'All dedications already have tokens.' })
  }

  // Update each with a fresh unique token
  let updated = 0
  for (const { id } of missing) {
    const shareToken = randomBytes(12).toString('base64url')
    await prisma.dedication.update({
      where: { id },
      data: { shareToken },
    })
    updated++
  }

  return NextResponse.json({ ok: true, updated, message: `Generated tokens for ${updated} dedication(s).` })
}
