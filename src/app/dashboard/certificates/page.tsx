import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SPECIES, OCCASIONS } from '@/data/constants'

interface CertRow { id: string; dedicationId: string; qrCodeData: string | null; createdAt: Date }
interface DedicationWithCerts {
  id: string
  occasionId: string
  recipientName: string
  recipientFrom: string | null
  message: string | null
  preferredDate: Date | null
  status: string
  shareToken: string | null
  certificates: CertRow[]
  tree: {
    speciesId: string
    plotBlock: string | null
    photos: { url: string }[]
  }
}

interface PageProps {
  searchParams: Promise<{ cert?: string }>
}

export default async function CertificatesPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const { cert: selectedCertId } = await searchParams

  // Build base URL dynamically from incoming request host
  const headersList = await headers()
  const host = headersList.get('host') || 'vanamitra-seven.vercel.app'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`

  const dedications = await prisma.dedication.findMany({
    where: { userId: session.userId },
    include: {
      certificates: { orderBy: { createdAt: 'desc' }, take: 1 },
      tree: {
        include: {
          photos: { orderBy: { takenAt: 'desc' }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }) as DedicationWithCerts[]

  const trees = dedications
  const treesWithCerts = dedications.filter((d: DedicationWithCerts) => d.certificates.length > 0 || d.status === 'CONFIRMED')

  if (treesWithCerts.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 40px',
          gap: 20,
        }}
      >
        <div style={{ fontSize: 56 }}>📜</div>
        <div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 24,
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 10,
            }}
          >
            No certificates yet
          </div>
          <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', maxWidth: 400 }}>
            Certificates are issued once your tree is planted. Check back after your planting confirmation.
          </p>
        </div>
        <Link href="/dashboard/trees" className="btn btn-outline">
          View your trees
        </Link>
      </div>
    )
  }

  const selectedTree =
    treesWithCerts.find((t) => t.id === selectedCertId) || treesWithCerts[0]
  const selectedCert = selectedTree.certificates[0] || null
  const species = SPECIES.find((s) => s.id === selectedTree.tree.speciesId)
  const occasion = OCCASIONS.find((o) => o.id === selectedTree.occasionId)

  const certNumber = `VNM-${selectedTree.id.slice(-8).toUpperCase()}`
  const plantedDate = selectedTree.preferredDate
    ? new Date(selectedTree.preferredDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Pending'

  const shareUrl = selectedTree.shareToken
    ? `${baseUrl}/certificate/${selectedTree.shareToken}`
    : null
  const whatsappMsg = encodeURIComponent(
    shareUrl
      ? `Check out my tree certificate on Vanamitra! I planted a ${species?.name || 'tree'} in ${selectedTree.recipientName}'s name on our Kheda farm. 🌳 ${shareUrl}`
      : `Check out Vanamitra — a tree dedication platform in Kheda, Gujarat. ${baseUrl}`
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h3 style={{ marginBottom: 6 }}>Certificates</h3>
        <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', fontSize: 15 }}>
          Your planting certificates — download, share, or display.
        </p>
      </div>

      {/* Thumbnail grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {treesWithCerts.map((tree) => {
          const cert = tree.certificates[0]
          const isSelected = tree.id === selectedTree.id
          return (
            <Link
              key={tree.id}
              href={`/dashboard/certificates?cert=${tree.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  border: `2px solid ${isSelected ? 'var(--terra)' : 'var(--line)'}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'oklch(0.97 0.012 75)',
                  transition: 'all 140ms',
                  cursor: 'pointer',
                }}
              >
                {/* A4 mini preview */}
                <div
                  style={{
                    background: 'oklch(0.97 0.012 75)',
                    padding: '14px 12px',
                    aspectRatio: '0.707',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    position: 'relative',
                    border: '3px double oklch(0.75 0.04 75)',
                    margin: 8,
                    borderRadius: 4,
                  }}
                >
                  <div style={{ fontSize: 18 }}>🌳</div>
                  <div
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 9,
                      textAlign: 'center',
                      color: 'var(--ink)',
                      fontStyle: 'italic',
                      lineHeight: 1.3,
                    }}
                  >
                    {tree.recipientName}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 7,
                      color: 'var(--ink-mute)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Vanamitra
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 10px 10px',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tree.recipientName}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 9,
                      color: 'var(--ink-mute)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginTop: 2,
                    }}
                  >
                    {SPECIES.find((s) => s.id === tree.tree.speciesId)?.name || tree.tree.speciesId}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <hr className="dotted-rule" />

      {/* Full certificate view */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 580,
            background: 'oklch(0.97 0.012 75)',
            border: '1px solid oklch(0.85 0.025 75)',
            borderRadius: 4,
            padding: '48px 52px',
            position: 'relative',
          }}
        >
          {/* Double border inset */}
          <div
            style={{
              position: 'absolute',
              inset: 12,
              border: '2px double oklch(0.72 0.05 75)',
              borderRadius: 2,
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 0,
            }}
          >
            {/* Header */}
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--moss)',
                marginBottom: 6,
              }}
            >
              Vanamitra · Kheda, Gujarat
            </div>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-mute)',
                marginBottom: 22,
              }}
            >
              Certificate of Tree Dedication
            </div>

            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 15,
                color: 'var(--ink-soft)',
                marginBottom: 10,
              }}
            >
              This certifies that
            </div>

            <div
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 32,
                fontWeight: 400,
                color: 'var(--forest)',
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              {selectedTree.recipientName}
            </div>

            {selectedTree.recipientFrom && (
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  color: 'var(--ink-soft)',
                  marginBottom: 14,
                }}
              >
                gifted by {selectedTree.recipientFrom}
              </div>
            )}

            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 15,
                color: 'var(--ink-soft)',
                marginBottom: 8,
              }}
            >
              has a dedicated
            </div>

            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 22,
                fontWeight: 500,
                color: 'var(--ink)',
                marginBottom: 4,
              }}
            >
              {species?.name || selectedTree.tree.speciesId}
            </div>
            {species?.latin && (
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: 'var(--ink-mute)',
                  marginBottom: 20,
                }}
              >
                {species.latin}
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                width: 80,
                height: 1,
                background: 'oklch(0.72 0.05 75)',
                margin: '4px 0 20px',
              }}
            />

            {/* Details grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px 32px',
                width: '100%',
                marginBottom: 24,
                textAlign: 'left',
              }}
            >
              {[
                { label: 'Occasion', value: occasion?.title || '—' },
                { label: 'Planted', value: plantedDate },
                {
                  label: 'Plot',
                  value: selectedTree.tree.plotBlock || 'Vasna Farm, Kheda',
                },
                {
                  label: 'Certificate No.',
                  value: certNumber,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 9,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-mute)',
                      marginBottom: 3,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 14,
                      color: 'var(--ink)',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {selectedTree.message && (
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: 'var(--ink-soft)',
                  borderTop: '1px solid oklch(0.85 0.025 75)',
                  borderBottom: '1px solid oklch(0.85 0.025 75)',
                  padding: '14px 0',
                  width: '100%',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                "{selectedTree.message}"
              </div>
            )}

            {/* Footer stamp */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              width: '100%',
              marginTop: 8,
              paddingTop: 16,
              borderTop: '1px dotted oklch(0.72 0.05 75)',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', lineHeight: 1.7 }}>
                {selectedTree.tree.plotBlock ? `Plot: ${selectedTree.tree.plotBlock}` : 'Vasna Farm, Kheda'}<br />
                Cert: {certNumber}
              </div>
              <div className="stamp" style={{ width: 72, height: 72, fontSize: 7.5, padding: 9, lineHeight: 1.6 }}>
                Living<br />tribute<br />· est 2026 ·
              </div>
            </div>
          </div>
        </div>

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
          <a href={`/api/dedications/${selectedTree.id}/certificate`} className="btn btn-primary btn-sm">
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
