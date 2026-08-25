import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SPECIES, OCCASIONS } from '@/data/constants'

interface PageProps {
  searchParams: Promise<{ tree?: string }>
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'var(--gold)',
  CONFIRMED: 'var(--moss)',
  CANCELLED: 'var(--ink-mute)',
}

export default async function TreesPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const { tree: selectedId } = await searchParams

  const dedications = await prisma.dedication.findMany({
    where: { userId: session.userId },
    include: {
      tree: {
        include: {
          photos: { orderBy: { takenAt: 'desc' }, take: 1 },
          updates: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (dedications.length === 0) {
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
        <div style={{ fontSize: 56 }}>🌱</div>
        <div>
          <div
            style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 500, color: 'var(--ink)', marginBottom: 10 }}
          >
            No trees yet
          </div>
          <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', maxWidth: 380 }}>
            Plant your first tree on our Kheda farm and watch it grow with monthly photo updates.
          </p>
        </div>
        <Link href="/plant" className="btn btn-primary">
          Plant your first tree →
        </Link>
      </div>
    )
  }

  const activeId = selectedId || dedications[0].id
  const selected = dedications.find((d) => d.id === activeId) || dedications[0]
  const { tree } = selected

  const coverPhoto = tree.photos[0]
  const species = SPECIES.find((s) => s.id === tree.speciesId)
  const occasion = OCCASIONS.find((o) => o.id === selected.occasionId)

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Left: list */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            marginBottom: 8,
            paddingLeft: 2,
          }}
        >
          {dedications.length} tree{dedications.length !== 1 ? 's' : ''}
        </div>

        {dedications.map((d) => {
          const dSpecies = SPECIES.find((s) => s.id === d.tree.speciesId)
          const isActive = d.id === activeId
          return (
            <Link
              key={d.id}
              href={`/dashboard/trees?tree=${d.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                textDecoration: 'none',
                background: isActive ? 'var(--paper-2)' : 'var(--paper)',
                border: `1px solid ${isActive ? 'var(--moss)' : 'var(--line)'}`,
                borderLeft: isActive ? '3px solid var(--terra)' : '1px solid var(--line)',
                paddingLeft: isActive ? 12 : 14,
                transition: 'all 140ms',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'var(--paper-3)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🌳
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--display)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 3,
                  }}
                >
                  {d.recipientName}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    color: 'var(--ink-mute)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {dSpecies?.name || d.tree.speciesId}
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: STATUS_COLOR[d.status] + '22',
                    color: STATUS_COLOR[d.status],
                    border: `1px solid ${STATUS_COLOR[d.status]}44`,
                  }}
                >
                  {STATUS_LABEL[d.status]}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Right: detail */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          {/* Cover photo */}
          {coverPhoto ? (
            <img
              src={`/api/blob?url=${encodeURIComponent(coverPhoto.url)}`}
              alt={coverPhoto.caption || 'Tree photo'}
              style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div className="photo-ph" style={{ height: 260 }}>
              <span>No photo yet</span>
            </div>
          )}

          <div style={{ padding: '24px 26px' }}>
            {/* Name + status */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <h3 style={{ fontSize: 22, marginBottom: 4 }}>{selected.recipientName}</h3>
                {selected.recipientFrom && (
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-mute)', fontStyle: 'italic' }}>
                    from {selected.recipientFrom}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: STATUS_COLOR[selected.status] + '18',
                  color: STATUS_COLOR[selected.status],
                  border: `1px solid ${STATUS_COLOR[selected.status]}44`,
                  flexShrink: 0,
                }}
              >
                {STATUS_LABEL[selected.status]}
              </span>
            </div>

            {/* Message */}
            {selected.message && (
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'var(--ink-soft)',
                  borderLeft: '3px solid var(--terra)',
                  paddingLeft: 14,
                  margin: '18px 0',
                  lineHeight: 1.6,
                }}
              >
                &ldquo;{selected.message}&rdquo;
              </p>
            )}

            {/* 4-stat grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
                margin: '20px 0',
                padding: '18px 0',
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
              }}
            >
              {[
                { label: 'Species', value: species?.name || tree.speciesId },
                {
                  label: 'Plot',
                  value: [tree.plotBlock, tree.plotRow, tree.plotPosition].filter(Boolean).join('-') || '—',
                },
                {
                  label: 'Tree ID',
                  value: tree.uniqueId,
                },
                {
                  label: 'Height',
                  value: tree.heightCm ? `${tree.heightCm} cm` : '—',
                },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-mute)',
                      marginBottom: 4,
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Occasion tag */}
            {occasion && (
              <div style={{ marginBottom: 20 }}>
                <span className="tag">{occasion.title}</span>
              </div>
            )}

            {/* Updates */}
            {tree.updates.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-mute)',
                    marginBottom: 14,
                  }}
                >
                  Recent updates
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tree.updates.map((update) => (
                    <div key={update.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {update.photoUrl ? (
                        <img
                          src={`/api/blob?url=${encodeURIComponent(update.photoUrl!)}`}
                          alt="Update"
                          style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 8,
                            background: 'var(--paper-3)',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 20,
                            flexShrink: 0,
                          }}
                        >
                          🌿
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: 'var(--mono)',
                            fontSize: 10,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--ink-mute)',
                            marginBottom: 4,
                          }}
                        >
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
      </div>
    </div>
  )
}
