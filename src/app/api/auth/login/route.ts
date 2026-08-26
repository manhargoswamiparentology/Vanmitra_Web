import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const payload = { userId: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin }
    await createSession(payload)
    const token = await signToken(payload)
    return NextResponse.json({ ok: true, token, isAdmin: user.isAdmin })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
