import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, city } = body

    if (!name && city === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updateData: Record<string, string> = {}
    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim()
    }
    if (city !== undefined) {
      updateData.city = typeof city === 'string' ? city.trim() : ''
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, name: true, email: true, city: true },
    })

    return NextResponse.json({ user })
  } catch (err) {
    console.error('PATCH /api/user', err)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, city: true, createdAt: true, isAdmin: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ user })
  } catch (err) {
    console.error('GET /api/user', err)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
