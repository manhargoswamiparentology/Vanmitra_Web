import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import InventoryEditForm from './InventoryEditForm'
import PhotoUploadAndUpdates from './PhotoUploadAndUpdates'
import CopyButton from './CopyButton'

const SPECIES: Record<string, string> = {
  neem: 'Neem',
  mango: 'Mango',
  peepal: 'Peepal',
  banyan: 'Banyan',
  drumstick: 'Drumstick',
  gulmohar: 'Gulmohar',
  arjun: 'Arjun',
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  DRAFT: {
    bg: 'var(--paper-2)',
    color: 'var(--ink-mute)',
  },
  FREE: {
    bg: 'color-mix(in oklch, var(--moss) 15%, var(--paper))',
    color: 'var(--moss)',
  },
  RESERVED: {
    bg: 'color-mix(in oklch, var(--terra) 15%, var(--paper))',
    color: 'var(--terra-deep)',
  },
  ALLOCATED: {
    bg: 'color-mix(in oklch, var(--forest) 15%, var(--paper))',
    color: 'var(--forest)',
  },
}

const HEALTH_COLOR: Record<string, string> = {
  // Schema stores lowercase by default; handle both cases
  healthy: 'var(--moss)',
  HEALTHY: 'var(--moss)',
  monitoring: 'var(--gold)',
  MONITORING: 'var(--gold)',
  stressed: 'var(--terra)',
  STRESSED: 'var(--terra)',
  diseased: 'var(--terra-deep)',
  DISEASED: 'var(--terra-deep)',
  deceased: 'var(--ink-mute)',
  DECEASED: 'var(--ink-mute)',
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: 'var(--ink-mute)',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: '1px solid var(--line)',
      }}
    >
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: 'var(--ink-mute)',
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 15, color: 'var(--ink)' }}>{value || '—'}</div>
    </div>
  )
}

export default async function AdminInventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const { id } = await params

  const tree = await prisma.inventoryTree.findUnique({
    where: { id },
    include: {
      dedication: {
        include: { user: { select: { name: true, email: true } } },
      },
      reservedBy: { select: { name: true, email: true } },
      photos: { orderBy: { takenAt: 'desc' } },
      updates: { orderBy: { createdAt: 'desc' } },
      _count: { select: { photos: true, updates: true } },
    },
  })

  if (!tree) notFound()

  const statusStyle = STATUS_STYLE[tree.status] || STATUS_STYLE.FREE
  const speciesName = SPECIES[tree.speciesId] || tree.speciesId

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 28,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
        }}
      >
        <Link href="/admin/inventory" style={{ color: 'var(--forest)', textDecoration: 'none' }}>
          Inventory
        </Link>
        <span>/</span>
        <span className="mono" style={{ color: 'var(--forest)' }}>
          {tree.uniqueId}
        </span>
      </div>

      {/* 1. Tree info card */}
      <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
        <SectionHeading>Tree Record</SectionHeading>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--forest)',
                letterSpacing: '0.04em',
                marginBottom: 6,
              }}
            >
              {tree.uniqueId}
            </div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 15 }}>{speciesName}</div>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: 999,
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: statusStyle.bg,
              color: statusStyle.color,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {tree.status}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px 24px',
          }}
        >
          <InfoRow
            label="Plot"
            value={
              tree.plotBlock || tree.plotRow || tree.plotPosition
                ? [
                    tree.plotBlock && `Block ${tree.plotBlock}`,
                    tree.plotRow && `Row ${tree.plotRow}`,
                    tree.plotPosition && `Pos ${tree.plotPosition}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : null
            }
          />
          <InfoRow label="Location Address" value={tree.locationAddress} />
          <InfoRow
            label="GPS"
            value={
              tree.gpsLat != null && tree.gpsLng != null
                ? `${tree.gpsLat.toFixed(6)}, ${tree.gpsLng.toFixed(6)}`
                : null
            }
          />
          <InfoRow
            label="Price"
            value={
              <span style={{ fontFamily: 'var(--display)', fontWeight: 600 }}>
                ₹{tree.price.toLocaleString('en-IN')}
              </span>
            }
          />
          <InfoRow
            label="Height"
            value={tree.heightCm != null ? `${tree.heightCm} cm` : null}
          />
          <InfoRow
            label="Health Status"
            value={
              tree.healthStatus ? (
                <span style={{ color: HEALTH_COLOR[tree.healthStatus] || 'var(--ink)' }}>
                  {tree.healthStatus.charAt(0) + tree.healthStatus.slice(1).toLowerCase()}
                </span>
              ) : null
            }
          />
          <InfoRow
            label="Added"
            value={new Date(tree.addedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <InfoRow label="Added By" value={tree.addedBy || null} />
          <InfoRow
            label="Photos / Updates"
            value={`${tree._count.photos} photos · ${tree._count.updates} updates`}
          />
        </div>

        {tree.notes && (
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              background: 'var(--paper-2)',
              borderRadius: 10,
              borderLeft: '3px solid var(--line)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-mute)',
                marginBottom: 6,
              }}
            >
              Admin Notes
            </div>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{tree.notes}</p>
          </div>
        )}
      </div>

      {/* 2. Edit form */}
      <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
        <SectionHeading>Edit Tree Details</SectionHeading>
        <InventoryEditForm
          tree={{
            id: tree.id,
            status: tree.status,
            speciesId: tree.speciesId,
            plotBlock: tree.plotBlock,
            plotRow: tree.plotRow,
            plotPosition: tree.plotPosition,
            locationAddress: tree.locationAddress,
            gpsLat: tree.gpsLat,
            gpsLng: tree.gpsLng,
            price: tree.price,
            heightCm: tree.heightCm,
            healthStatus: tree.healthStatus,
            notes: tree.notes,
          }}
        />
      </div>

      {/* 3. QR Code */}
      {tree.qrCodeData && (
        <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
          <SectionHeading>QR Code</SectionHeading>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 20px',
              background: 'var(--paper-2)',
              borderRadius: 10,
              border: '1px solid var(--line)',
            }}
          >
            <code
              className="mono"
              style={{
                fontSize: 13,
                color: 'var(--forest-deep)',
                flex: 1,
                wordBreak: 'break-all',
              }}
            >
              {tree.qrCodeData}
            </code>
            <CopyButton value={tree.qrCodeData} />
          </div>
        </div>
      )}

      {/* 4. Dedication details (ALLOCATED) */}
      {tree.status === 'ALLOCATED' && tree.dedication && (
        <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
          <SectionHeading>Dedication Details</SectionHeading>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 24px',
            }}
          >
            <InfoRow label="Recipient" value={tree.dedication.recipientName} />
            <InfoRow label="Occasion" value={tree.dedication.occasionId} />
            <InfoRow
              label="From (user name)"
              value={tree.dedication.user.name || null}
            />
            <InfoRow label="User Email" value={tree.dedication.user.email} />
          </div>
        </div>
      )}

      {/* 4b. Reserved by (RESERVED) */}
      {tree.status === 'RESERVED' && tree.reservedBy && (
        <div
          className="card"
          style={{
            padding: '24px 28px',
            marginBottom: 24,
            borderLeft: '3px solid var(--terra)',
          }}
        >
          <SectionHeading>Reserved By</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            <InfoRow
              label="Name"
              value={tree.reservedBy.name || null}
            />
            <InfoRow label="Email" value={tree.reservedBy.email} />
            {tree.reservedUntil && (
              <InfoRow
                label="Expires"
                value={new Date(tree.reservedUntil).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
            )}
          </div>
        </div>
      )}

      {/* 5. Photos grid + 6. Photo upload + 7. Updates + 8. Send update form */}
      <PhotoUploadAndUpdates
        treeId={tree.id}
        photos={tree.photos.map((p: {
          id: string
          url: string
          caption: string | null
          takenAt: Date
        }) => ({
          id: p.id,
          url: p.url,
          caption: p.caption,
          takenAt: p.takenAt.toISOString(),
        }))}
        updates={tree.updates.map((u: {
          id: string
          message: string
          photoUrl: string | null
          createdAt: Date
          createdBy: string | null
        }) => ({
          id: u.id,
          message: u.message,
          photoUrl: u.photoUrl,
          createdAt: u.createdAt.toISOString(),
          createdBy: u.createdBy,
        }))}
      />
    </div>
  )
}

