import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company, contact, email, phone, trees, occasion, message } = body

    if (!company || !contact || !email) {
      return NextResponse.json(
        { error: 'Company name, contact name, and email are required.' },
        { status: 400 }
      )
    }

    await prisma.corporateEnquiry.create({
      data: {
        company,
        contact,
        email,
        phone:     phone     || null,
        employees: trees     || null,   // "trees" field holds employee count
        occasion:  occasion  || null,
        message:   message   || null,
        status: 'new',
      },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/csr', err)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
