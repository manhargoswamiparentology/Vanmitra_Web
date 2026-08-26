import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SPECIES } from '@/data/constants'

interface DedicationRow {
  id: string
  recipientName: string
  status: string
  certificates: { id: string }[]
  tree: { speciesId: string }
}

export default async function CertificatesPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const dedications = await prisma.dedication.findMany({
    where: { userId: session.userId },
    include: {
      certificates: { orderBy: { createdAt: 'desc' }, take: 1 },
      tree: { select: { speciesId: true } },
    },
    orderBy: { createdAt: 'desc' },
  }) as DedicationRow[]

  const treesWithCerts = dedications.filter((d) => d.certificates.length > 0 || d.status === 'CONFIRMED')

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h3 style={{ marginBottom: 6 }}>Certificates</h3>
        <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', fontSize: 15 }}>
          Your planting certificates — click one to download, share, or display.
        </p>
      </div>

      {/* Thumbnail grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {treesWithCerts.map((tree) => {
          const speciesName = SPECIES.find((s) => s.id === tree.tree.speciesId)?.name || tree.tree.speciesId
          return (
            <Link
              key={tree.id}
              href={`/dashboard/certificates/${tree.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ padding: 10 }}>
                {/* Mini certificate */}
                <div
                  style={{
                    aspectRatio: '0.72',
                    background: 'oklch(0.97 0.014 80)',
                    border: '2px double oklch(0.72 0.06 65)',
                    borderRadius: 6,
                    padding: '16px 10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Faint corner flourishes */}
                  <span style={{ position: 'absolute', top: -6, left: -8, fontSize: 34, opacity: 0.07, transform: 'rotate(-12deg)' }}>🌿</span>
                  <span style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 34, opacity: 0.07, transform: 'rotate(165deg)' }}>🌿</span>

                  {/* Wordmark */}
                  <div style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--mono)', fontSize: 7, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--moss)' }}>
                    Vanamitra
                  </div>

                  {/* Ornamental divider */}
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5, width: '68%', margin: '7px 0 0' }}>
                    <span style={{ flex: 1, height: 1, background: 'oklch(0.72 0.06 65)' }} />
                    <span style={{ fontSize: 7, color: 'oklch(0.72 0.06 65)', lineHeight: 1 }}>❦</span>
                    <span style={{ flex: 1, height: 1, background: 'oklch(0.72 0.06 65)' }} />
                  </div>

                  {/* Center content */}
                  <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, minHeight: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 6.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--terra)' }}>
                      Tree Dedication
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--serif)',
                        fontStyle: 'italic',
                        fontSize: 17,
                        color: 'var(--forest)',
                        lineHeight: 1.15,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {tree.recipientName}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                      {speciesName}
                    </div>
                  </div>

                  {/* Seal */}
                  <div
                    className="stamp"
                    style={{
                      position: 'absolute',
                      zIndex: 1,
                      bottom: 8,
                      right: 8,
                      width: 32,
                      height: 32,
                      fontSize: 4.3,
                      padding: 3,
                      lineHeight: 1.1,
                      letterSpacing: '0.1em',
                    }}
                  >
                    Est<br />2026
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
