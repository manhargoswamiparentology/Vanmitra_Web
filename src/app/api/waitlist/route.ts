import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/waitlist
export async function POST(req: NextRequest) {
  try {
    const { email, name, note } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }

    const existing = await prisma.waitlistEntry.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ ok: true, alreadyExists: true })
    }

    await prisma.waitlistEntry.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        note: note?.trim() || null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
