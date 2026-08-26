import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SPECIES } from '@/data/constants'

interface Props {
  params: Promise<{ uniqueId: string }>
}

// Public page a tree's physical QR marker points to. Trees that have already
// been dedicated hand off to the richer /certificate/[shareToken] page —
// this page only needs to cover trees that aren't dedicated yet.
export default async function PublicTreePage({ params }: Props) {
  const { uniqueId } = await params

  const tree = await prisma.inventoryTree.findUnique({
    where: { uniqueId },
    select: {
      uniqueId: true,
      speciesId: true,
      plotBlock: true,
      plotRow: true,
      plotPosition: true,
      locationAddress: true,
      heightCm: true,
      status: true,
      addedAt: true,
      dedication: { select: { shareToken: true } },
      photos: { orderBy: { takenAt: 'desc' }, take: 1 },
      updates: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!tree) notFound()

  if (tree.dedication?.shareToken) {
    redirect(`/certificate/${tree.dedication.shareToken}`)
  }

  const species = SPECIES.find((s) => s.id === tree.speciesId)
  const coverPhoto = tree.photos[0]
  const plotDisplay =
    tree.locationAddress ||
    ([tree.plotBlock, tree.plotRow, tree.plotPosition].filter(Boolean).length
      ? `Block ${[tree.plotBlock, tree.plotRow, tree.plotPosition].filter(Boolean).join('-')} — Vasna Village, Kheda, Gujarat`
      : 'Vasna Village, Kheda, Gujarat')

  const isAvailable = tree.status === 'FREE'

  return (
    <div style={{ padding: '40px 0 100px', background: 'var(--paper)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px' }}>
        {/* Vanamitra header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500, color: 'var(--forest)' }}>
              Vanam<em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--moss)' }}>itra</em>
            </div>
          </Link>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginTop: 6 }}>
            Tree {tree.uniqueId}
          </p>
        </div>

        <div className="card" style={{ overflow: 'hidden', padding: 0, marginBottom: 28 }}>
          {coverPhoto ? (
            <img
              src={`/api/blob?url=${encodeURIComponent(coverPhoto.url)}`}
              alt={coverPhoto.caption || 'Tree photo'}
              style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div className="photo-ph" style={{ height: 240 }}>
              <span>No photo yet</span>
            </div>
          )}

          <div style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h1 style={{ fontSize: 24, marginBottom: 4 }}>{species?.name || tree.speciesId}</h1>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-mute)' }}>
                  {species?.latin || 'Species native to Gujarat'}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: isAvailable
                    ? 'color-mix(in oklch, var(--moss) 15%, var(--paper))'
                    : 'var(--paper-2)',
                  color: isAvailable ? 'var(--moss)' : 'var(--ink-mute)',
                  border: `1px solid ${isAvailable ? 'var(--moss)' : 'var(--line)'}44`,
                  flexShrink: 0,
                }}
              >
                {isAvailable ? 'Available' : 'Not yet available'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 14,
                margin: '20px 0',
                padding: '18px 0',
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
              }}
            >
              {[
                { label: 'Location', value: plotDisplay },
                { label: 'Height', value: tree.heightCm ? `${tree.heightCm} cm` : '—' },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {tree.updates.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 14 }}>
                  Recent updates
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tree.updates.map((update) => (
                    <div key={update.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {update.photoUrl ? (
                        <img
                          src={`/api/blob?url=${encodeURIComponent(update.photoUrl)}`}
                          alt="Update"
                          style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--paper-3)', display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>
                          🌿
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>
                          {new Date(update.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>
                          {update.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'var(--forest)', borderRadius: 16, padding: '28px 28px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 500, color: 'var(--paper)', marginBottom: 10 }}>
            {isAvailable ? 'This tree is waiting for a name' : 'This tree is being prepared'}
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'color-mix(in srgb, var(--paper) 75%, transparent)', lineHeight: 1.6, marginBottom: 20 }}>
            {isAvailable
              ? 'Dedicate this tree to someone — a name, an occasion, a message that grows with it.'
              : 'It isn\'t open for dedication yet, but you can plant one of your own on the same farm.'}
          </p>
          <Link href="/plant" className="btn btn-terra">
            Plant a tree →
          </Link>
        </div>
      </div>
    </div>
  )
}
