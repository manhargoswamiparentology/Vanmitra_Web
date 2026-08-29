import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SPECIES, OCCASIONS } from '@/data/constants'
import CertificateCard from '../CertificateCard'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const { id } = await params

  const headersList = await headers()
  const host = headersList.get('host') || 'vanamitra-seven.vercel.app'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`

  const dedication = await prisma.dedication.findFirst({
    where: {
      id,
      OR: [
        { userId: session.userId },
        { employeeEmail: { equals: session.email, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      occasionId: true,
      recipientName: true,
      recipientFrom: true,
      message: true,
      preferredDate: true,
      status: true,
      shareToken: true,
      tree: { select: { speciesId: true, plotBlock: true } },
    },
  })

  if (!dedication || dedication.status !== 'CONFIRMED') notFound()

  const species = SPECIES.find((s) => s.id === dedication.tree.speciesId)
  const occasion = OCCASIONS.find((o) => o.id === dedication.occasionId)

  const certNumber = `VNM-${dedication.id.slice(-8).toUpperCase()}`
  const plantedDate = (dedication.preferredDate ?? dedication.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shareUrl = dedication.shareToken ? `${baseUrl}/certificate/${dedication.shareToken}` : null
  const whatsappMsg = encodeURIComponent(
    shareUrl
      ? `Check out my tree certificate on Vanamitra! I planted a ${species?.name || 'tree'} in ${dedication.recipientName}'s name on our Kheda farm. 🌳 ${shareUrl}`
      : `Check out Vanamitra — a tree dedication platform in Kheda, Gujarat. ${baseUrl}`
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Link
          href="/dashboard/certificates"
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex' }}
        >
          ← Back to certificates
        </Link>
        <h3 style={{ marginBottom: 6 }}>{dedication.recipientName}&apos;s certificate</h3>
        <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', fontSize: 15 }}>
          Download, share, or display this certificate.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CertificateCard
          recipientName={dedication.recipientName}
          recipientFrom={dedication.recipientFrom}
          message={dedication.message}
          speciesName={species?.name || dedication.tree.speciesId}
          speciesLatin={species?.latin}
          occasionTitle={occasion?.title || '—'}
          plantedDate={plantedDate}
          plotLabel={dedication.tree.plotBlock || 'Vasna Farm, Kheda'}
          certNumber={certNumber}
        />

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <a href={`/api/dedications/${dedication.id}/certificate`} className="btn btn-primary btn-sm">
            Download PDF
          </a>
          {shareUrl && (
            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              Share on WhatsApp
            </a>
          )}
          {shareUrl && (
            <a
              href={`mailto:?subject=My Vanamitra Tree Certificate&body=${decodeURIComponent(whatsappMsg)}`}
              className="btn btn-ghost btn-sm"
            >
              Share via Email
            </a>
          )}
          {shareUrl && (
            <Link href={shareUrl} target="_blank" className="btn btn-ghost btn-sm">
              View public certificate →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
