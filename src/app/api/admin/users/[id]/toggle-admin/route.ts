import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// POST /api/admin/users/[id]/toggle-admin — flip a user's isAdmin flag
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (id === session.userId) {
    return NextResponse.json({ error: 'Cannot change your own admin status' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const user = await prisma.user.update({
    where: { id },
    data: { isAdmin: !target.isAdmin },
  })

  return NextResponse.json({ ok: true, isAdmin: user.isAdmin })
}
