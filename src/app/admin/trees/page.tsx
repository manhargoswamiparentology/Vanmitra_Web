import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface DedicationRow {
  id: string
  recipientName: string
  occasionId: string
  status: string
  createdAt: Date
  user: { email: string; name: string }
  tree: { uniqueId: string; speciesId: string }
}

// Prepaid system: all bookings arrive as CONFIRMED.
// Tabs: All | Confirmed | Cancelled
const STATUS_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  CONFIRMED: { bg: 'color-mix(in oklch, var(--moss) 15%, var(--paper))', color: 'var(--moss)' },
  CANCELLED: { bg: 'color-mix(in oklch, var(--ink-mute) 15%, var(--paper))', color: 'var(--ink-mute)' },
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const { status = 'ALL' } = await searchParams
  const activeStatus = status.toUpperCase()

  const whereClause =
    activeStatus === 'ALL'
      ? {}
      : { status: activeStatus as 'CONFIRMED' | 'CANCELLED' }

  const dedications = await prisma.dedication.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, name: true } },
      tree: { select: { uniqueId: true, speciesId: true } },
    },
  }) as DedicationRow[]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Admin / Bookings</div>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Tree Bookings</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
          {dedications.length} booking{dedications.length !== 1 ? 's' : ''} in this view.
        </p>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)' }}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value
          return (
            <Link
              key={tab.value}
              href={`/admin/trees?status=${tab.value}`}
              style={{
                fontFamily: 'var(--display)',
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--ink)' : 'var(--ink-mute)',
                padding: '10px 16px',
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid var(--forest)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 160ms',
              }}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      {dedications.length === 0 ? (
        <div
          className="card"
          style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-mute)', fontStyle: 'italic' }}
        >
          No bookings yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: 'var(--display)' }}>
            <thead>
              <tr style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
                {['Order ID', 'Tree ID', 'Recipient', 'Occasion', 'Species', 'User', 'Status', 'Date', ''].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-mute)',
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dedications.map((d: DedicationRow, i: number) => {
                const statusStyle = STATUS_COLORS[d.status] ?? STATUS_COLORS.CONFIRMED
                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-2)',
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>
                      #{d.id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--forest)', whiteSpace: 'nowrap' }}>
                      {d.tree.uniqueId}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 500, color: 'var(--ink)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.recipientName}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--ink-soft)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.occasionId}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--ink-soft)', fontStyle: 'italic', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.tree.speciesId}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--ink-mute)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {d.user.name}<br />
                      <span style={{ fontSize: 11 }}>{d.user.email}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontFamily: 'var(--mono)',
                          fontSize: 10,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 500,
                        }}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>
                      {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Link
                        href={`/admin/trees/${d.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px 14px', fontSize: 13, textDecoration: 'none' }}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
