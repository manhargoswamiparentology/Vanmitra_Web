import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getDedicationPdfContext } from '@/lib/pdf/dedicationData'
import { generateInvoicePdf } from '@/lib/pdf/invoice'

// GET /api/dedications/[id]/invoice — streams the tax invoice as a downloadable PDF.
// Replaces the old window.print() flow, which relied on `body > * { display:none }` +
// re-showing #invoice-print by id — that pattern breaks because a hidden ancestor still
// hides its descendants no matter what display value the descendant sets, so the print
// preview came out blank.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headersList = await headers()
  const host = headersList.get('host') || 'vanamitra-seven.vercel.app'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`

  const ctx = await getDedicationPdfContext(id, baseUrl)
  if (!ctx) {
    return NextResponse.json({ error: 'Dedication not found' }, { status: 404 })
  }

  const { dedication, speciesName, occasionTitle, shortId, invoiceNo, invoiceDate, location } = ctx

  const pdf = await generateInvoicePdf({
    invoiceNo,
    invoiceDate,
    billedToName: dedication.user.name,
    billedToEmail: dedication.user.email,
    corporateName: dedication.corporateName,
    orderId: shortId,
    treeUniqueId: dedication.tree.uniqueId,
    occasionTitle,
    itemDescription: `${speciesName} tree dedication`,
    itemSubline: `Dedicated to ${dedication.recipientName} · ${location}`,
    amount: dedication.tree.price ?? 500,
    status: 'CONFIRMED',
  })

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoiceNo}.pdf"`,
    },
  })
}
