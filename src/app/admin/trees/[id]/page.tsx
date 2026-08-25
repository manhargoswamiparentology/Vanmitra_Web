import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AdminActions from './AdminActions'
import { SPECIES, OCCASIONS } from '@/data/constants'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: 'color-mix(in oklch, var(--terra) 15%, var(--paper))', color: 'var(--terra-deep)' },
  CONFIRMED: { bg: 'color-mix(in oklch, var(--moss) 15%, var(--paper))', color: 'var(--moss)' },
  CANCELLED: { bg: 'color-mix(in oklch, var(--ink-mute) 15%, var(--paper))', color: 'var(--ink-mute)' },
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const { id } = await params

  // id = Dedication id
  const dedication = await prisma.dedication.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      tree: {
        include: {
          photos: { orderBy: { takenAt: 'desc' } },
          updates: { orderBy: { createdAt: 'desc' } },
        },
      },
    },
  })

  if (!dedication) notFound()

  const { tree } = dedication
  const statusStyle = STATUS_COLORS[dedication.status] || STATUS_COLORS.PENDING
  const species = SPECIES.find((s) => s.id === tree.speciesId)
  const occasion = OCCASIONS.find((o) => o.id === dedication.occasionId)

  return (
    <div style={{ maxWidth: 860 }}>
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
        <Link href="/admin/trees" style={{ color: 'var(--forest)', textDecoration: 'none' }}>
          Orders
        </Link>
        <span>/</span>
        <span>{dedication.recipientName}</span>
      </div>

      {/* 1. Order info card */}
      <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
            gap: 16,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Order / Dedication</div>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
              {dedication.recipientName}
            </h3>
            <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
              From: {dedication.recipientFrom || '—'}
            </div>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '5px 14px',
              borderRadius: 999,
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: statusStyle.bg,
              color: statusStyle.color,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {dedication.status}
          </span>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 16 }}
        >
          {[
            { label: 'Occasion', value: occasion?.title || dedication.occasionId },
            { label: 'Species', value: species?.name || tree.speciesId },
            { label: 'Tree ID', value: tree.uniqueId },
            { label: 'Tree Price', value: `₹${tree.price}` },
            { label: 'User Email', value: dedication.user.email },
            { label: 'User Name', value: dedication.user.name },
            {
              label: 'Plot',
              value: tree.plotBlock
                ? `${tree.plotBlock} · ${tree.plotRow || ''} · ${tree.plotPosition || ''}`
                : '—',
            },
            {
              label: 'GPS',
              value: tree.gpsLat ? `${tree.gpsLat}, ${tree.gpsLng}` : '—',
            },
            { label: 'Height', value: tree.heightCm ? `${tree.heightCm} cm` : '—' },
            {
              label: 'Preferred Date',
              value: dedication.preferredDate
                ? new Date(dedication.preferredDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—',
            },
            {
              label: 'Order Date',
              value: new Date(dedication.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            },
          ].map((field) => (
            <div key={field.label}>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                  marginBottom: 3,
                }}
              >
                {field.label}
              </div>
              <div style={{ fontSize: 15, color: 'var(--ink)' }}>{field.value}</div>
            </div>
          ))}
        </div>

        {dedication.message && (
          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              background: 'var(--paper-2)',
              borderRadius: 10,
              borderLeft: '3px solid var(--moss)',
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
              Personal Message
            </div>
            <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)', fontSize: 15 }}>
              &ldquo;{dedication.message}&rdquo;
            </p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Link
            href={`/admin/inventory/${tree.id}`}
            style={{ fontSize: 13, color: 'var(--forest)', textDecoration: 'underline' }}
          >
            View / Edit this tree in Inventory →
          </Link>
        </div>
      </div>

      {/* 2. Admin actions (client component) */}
      <AdminActions
        dedicationId={dedication.id}
        currentStatus={dedication.status}
        photoCount={tree.photos.length}
      />

      {/* 3. Photos section */}
      <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            marginBottom: 20,
          }}
        >
          Photos ({tree.photos.length})
        </div>

        {tree.photos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {tree.photos.map((photo: { id: string; url: string; caption: string | null; takenAt: Date }) => (
              <div key={photo.id} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)' }}>
                <img
                  src={`/api/blob?url=${encodeURIComponent(photo.url)}`}
                  alt={photo.caption || 'Tree photo'}
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '8px 10px', background: 'var(--paper-2)' }}>
                  {photo.caption && (
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 3 }}>{photo.caption}</p>
                  )}
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' }}>
                    {new Date(photo.takenAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--ink-mute)', fontStyle: 'italic', fontSize: 14 }}>No photos yet.</p>
        )}
      </div>

      {/* 4. Updates section */}
      <div className="card" style={{ padding: '24px' }}>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            marginBottom: 20,
          }}
        >
          Updates ({tree.updates.length})
        </div>

        {tree.updates.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {tree.updates.map((update: { id: string; message: string; photoUrl: string | null; createdAt: Date }, i: number) => (
              <div key={update.id}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}
                >
                  <p style={{ fontSize: 15, color: 'var(--ink)', flex: 1 }}>{update.message}</p>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {new Date(update.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {update.photoUrl && (
                  <img
                    src={`/api/blob?url=${encodeURIComponent(update.photoUrl!)}`}
                    alt="Update photo"
                    style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
                  />
                )}
                {i < tree.updates.length - 1 && <hr className="dotted-rule" style={{ margin: '12px 0 0' }} />}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--ink-mute)', fontStyle: 'italic', fontSize: 14 }}>No updates sent yet.</p>
        )}
      </div>
    </div>
  )
}
