import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getDedicationPdfContext } from '@/lib/pdf/dedicationData'
import { generateCertificatePdf } from '@/lib/pdf/certificate'

// GET /api/dedications/[id]/certificate — streams the certificate as a downloadable PDF.
// Same access model as the /dedications/[id] and /certificate/[shareToken] pages: knowing
// the id is the "key", no additional auth check.
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

  const { dedication, species, occasion, speciesName, shortId, dateLabel, location, shareUrl, dedicatedBy } = ctx

  const pdf = await generateCertificatePdf({
    certificateNo: shortId,
    speciesName,
    speciesLatin: species?.latin ?? 'Species native to Gujarat',
    occasionTagline: occasion?.tagline ?? 'A living tribute',
    recipientName: dedication.recipientName,
    dedicatedBy,
    message: dedication.message,
    treeUniqueId: dedication.tree.uniqueId,
    location,
    dateLabel,
    shareUrl,
  })

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Certificate-${shortId}.pdf"`,
    },
  })
}
