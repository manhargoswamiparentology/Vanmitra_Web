import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// PATCH /api/admin/enquiries  — update status on one enquiry
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status } = await req.json()
  if (!id || !['new', 'read', 'replied'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const enquiry = await prisma.corporateEnquiry.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ ok: true, enquiry })
}
