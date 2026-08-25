import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    name?: string
    city?: string
    currentPassword?: string
    newPassword?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Password change path
  if (body.currentPassword !== undefined || body.newPassword !== undefined) {
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json({ error: 'Both current and new passwords are required.' }, { status: 400 })
    }
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })

    const hash = await bcrypt.hash(body.newPassword, 12)
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: hash } })

    return NextResponse.json({ ok: true })
  }

  // Profile update path
  const updateData: { name?: string; city?: string } = {}
  if (body.name !== undefined) {
    if (!body.name.trim()) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 })
    updateData.name = body.name.trim()
  }
  if (body.city !== undefined) {
    updateData.city = body.city.trim() || null as unknown as string
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: updateData,
    select: { id: true, name: true, email: true, city: true },
  })

  return NextResponse.json(updated)
}
