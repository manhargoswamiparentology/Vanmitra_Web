import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import FixQrCodesButton from './FixQrCodesButton'

const SPECIES: Record<string, string> = {
  neem: 'Neem',
  mango: 'Mango',
  peepal: 'Peepal',
  banyan: 'Banyan',
  drumstick: 'Drumstick',
  gulmohar: 'Gulmohar',
  arjun: 'Arjun',
}

type InventoryStatus = 'DRAFT' | 'FREE' | 'RESERVED' | 'ALLOCATED'

interface InventoryTree {
  id: string
  uniqueId: string
  speciesId: string
  plotBlock: string | null
  plotRow: string | null
  plotPosition: string | null
  gpsLat: number | null
  gpsLng: number | null
  price: number
  status: InventoryStatus
  reservedUntil: Date | null
  addedAt: Date
  dedication: {
    user: { name: string | null; email: string }
    recipientName: string
    occasionId: string
  } | null
  reservedBy: { name: string | null; email: string } | null
  _count: { photos: number; updates: number }
}

const STATUS_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Free', value: 'FREE' },
  { label: 'Reserved', value: 'RESERVED' },
  { label: 'Allocated', value: 'ALLOCATED' },
]

const STATUS_STYLE: Record<InventoryStatus, { border: string; badgeBg: string; badgeColor: string }> = {
  DRAFT: {
    border: 'var(--ink-mute)',
    badgeBg: 'var(--paper-2)',
    badgeColor: 'var(--ink-mute)',
  },
  FREE: {
    border: 'var(--moss)',
    badgeBg: 'color-mix(in oklch, var(--moss) 15%, var(--paper))',
    badgeColor: 'var(--moss)',
  },
  RESERVED: {
    border: 'var(--terra)',
    badgeBg: 'color-mix(in oklch, var(--terra) 15%, var(--paper))',
    badgeColor: 'var(--terra-deep)',
  },
  ALLOCATED: {
    border: 'var(--forest)',
    badgeBg: 'color-mix(in oklch, var(--forest) 15%, var(--paper))',
    badgeColor: 'var(--forest)',
  },
}

function formatExpiry(date: Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; month?: string }>
}) {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const { status = 'ALL', month = 'ALL' } = await searchParams
  const activeTab = status.toUpperCase()

  // Build month date range filter
  let monthFilter: { gte: Date; lt: Date } | undefined
  if (month && month !== 'ALL') {
    const [y, m] = month.split('-').map(Number)
    const start = new Date(y, m - 1, 1)
    const end   = new Date(y, m, 1)
    monthFilter = { gte: start, lt: end }
  }

  const statusWhere = activeTab !== 'ALL' ? { status: activeTab as InventoryStatus } : {}
  const baseWhere = { ...statusWhere, ...(monthFilter ? { addedAt: monthFilter } : {}) }

  // Fetch counts for stat summary (ignore month filter for summary)
  const [draftCount, freeCount, reservedCount, allocatedCount] = await Promise.all([
    prisma.inventoryTree.count({ where: { status: 'DRAFT' } }),
    prisma.inventoryTree.count({ where: { status: 'FREE' } }),
    prisma.inventoryTree.count({ where: { status: 'RESERVED' } }),
    prisma.inventoryTree.count({ where: { status: 'ALLOCATED' } }),
  ])

  // Get distinct months that have trees (for month tabs)
  const allDates = await prisma.inventoryTree.findMany({
    select: { addedAt: true },
    orderBy: { addedAt: 'desc' },
  })
  const monthSet = new Set<string>()
  for (const { addedAt } of allDates) {
    const d = new Date(addedAt)
    monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const availableMonths = Array.from(monthSet).sort().reverse() // newest first

  const trees = await prisma.inventoryTree.findMany({
    where: baseWhere,
    orderBy: { addedAt: 'desc' },
    include: {
      dedication: {
        include: { user: { select: { name: true, email: true } } },
      },
      reservedBy: { select: { name: true, email: true } },
      _count: { select: { photos: true, updates: true } },
    },
  })

  return (
    <div>
      {/* Header */}
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
          <div className="eyebrow" style={{ marginBottom: 10 }}>Admin / Inventory</div>
          <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 12 }}>Tree Inventory</h2>

          {/* Stat summary */}
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Draft', count: draftCount, color: 'var(--ink-mute)' },
              { label: 'Free', count: freeCount, color: 'var(--moss)' },
              { label: 'Reserved', count: reservedCount, color: 'var(--terra-deep)' },
              { label: 'Allocated', count: allocatedCount, color: 'var(--forest)' },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--ink-soft)',
                  }}
                >
                  <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{count}</strong>{' '}
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexShrink: 0 }}>
          <FixQrCodesButton />
          <Link
            href="/admin/inventory/new"
            className="btn btn-primary"
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            + Add Tree
          </Link>
        </div>
      </div>

      {/* Tab strip */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 28,
          borderBottom: '1px solid var(--line)',
        }}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value
          return (
            <Link
              key={tab.value}
              href={`/admin/inventory?status=${tab.value}`}
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

      {/* Month filter row */}
      {availableMonths.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginRight: 4 }}>
            Month
          </span>
          {[{ label: 'All months', value: 'ALL' }, ...availableMonths.map(m => {
            const [y, mo] = m.split('-').map(Number)
            const label = new Date(y, mo - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
            return { label, value: m }
          })].map(tab => {
            const isActive = month === tab.value || (tab.value === 'ALL' && (!month || month === 'ALL'))
            return (
              <Link
                key={tab.value}
                href={`/admin/inventory?status=${status}&month=${tab.value}`}
                style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
                  padding: '4px 12px', borderRadius: 999,
                  border: isActive ? '1.5px solid var(--forest)' : '1px solid var(--line)',
                  background: isActive ? 'var(--forest)' : 'transparent',
                  color: isActive ? 'var(--paper)' : 'var(--ink-mute)',
                  textDecoration: 'none', transition: 'all 140ms',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      )}

      {/* Tree cards grid */}
      {trees.length === 0 ? (
        <div
          style={{
            border: '2px dashed var(--line)',
            borderRadius: 14,
            padding: '56px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--ink-mute)', fontSize: 15, marginBottom: 16 }}>
            No trees in inventory.
          </p>
          <Link
            href="/admin/inventory/new"
            style={{ color: 'var(--forest)', fontFamily: 'var(--display)', fontSize: 14 }}
          >
            Add your first tree →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {trees.map((tree: InventoryTree) => {
            const style = STATUS_STYLE[tree.status] || STATUS_STYLE.FREE
            const speciesName = SPECIES[tree.speciesId] || tree.speciesId

            return (
              <div
                key={tree.id}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderLeft: `3px solid ${style.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ padding: '16px 18px', flex: 1 }}>
                  {/* Header row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                      gap: 8,
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--forest)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {tree.uniqueId}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 9px',
                        borderRadius: 999,
                        fontFamily: 'var(--mono)',
                        fontSize: 9,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        background: style.badgeBg,
                        color: style.badgeColor,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {tree.status}
                    </span>
                  </div>

                  {/* Species + plot */}
                  <div
                    className="mono-sm"
                    style={{ color: 'var(--ink-soft)', marginBottom: 10, fontSize: 11 }}
                  >
                    {speciesName}
                    {(tree.plotBlock || tree.plotRow || tree.plotPosition) && (
                      <span style={{ color: 'var(--ink-mute)' }}>
                        {' · '}
                        {[
                          tree.plotBlock && `Block ${tree.plotBlock}`,
                          tree.plotRow && `Row ${tree.plotRow}`,
                          tree.plotPosition && `Pos ${tree.plotPosition}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: 20,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      marginBottom: 8,
                    }}
                  >
                    ₹{tree.price.toLocaleString('en-IN')}
                  </div>

                  {/* GPS */}
                  {tree.gpsLat != null && tree.gpsLng != null && (
                    <div
                      className="mono-sm"
                      style={{ color: 'var(--ink-mute)', fontSize: 10, marginBottom: 8 }}
                    >
                      {tree.gpsLat.toFixed(6)}, {tree.gpsLng.toFixed(6)}
                    </div>
                  )}

                  {/* Reserved info */}
                  {tree.status === 'RESERVED' && tree.reservedBy && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '8px 10px',
                        background: 'color-mix(in oklch, var(--terra) 8%, var(--paper))',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ color: 'var(--terra-deep)', marginBottom: 2 }}>
                        Reserved by {tree.reservedBy.email}
                      </div>
                      {tree.reservedUntil && (
                        <div
                          style={{
                            fontFamily: 'var(--mono)',
                            fontSize: 10,
                            color: 'var(--terra)',
                          }}
                        >
                          Expires {formatExpiry(tree.reservedUntil)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Allocated info */}
                  {tree.status === 'ALLOCATED' && tree.dedication && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '8px 10px',
                        background: 'color-mix(in oklch, var(--moss) 8%, var(--paper))',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ color: 'var(--forest)', marginBottom: 2 }}>
                        Allocated to {tree.dedication.user.name || tree.dedication.user.email}
                      </div>
                      <div style={{ color: 'var(--moss)', fontStyle: 'italic' }}>
                        For {tree.dedication.recipientName}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 18px',
                    borderTop: '1px solid var(--line)',
                    background: 'var(--paper-2)',
                  }}
                >
                  <span
                    className="mono-sm"
                    style={{ fontSize: 10, color: 'var(--ink-mute)' }}
                  >
                    {tree._count.photos} photo{tree._count.photos !== 1 ? 's' : ''} ·{' '}
                    {tree._count.updates} update{tree._count.updates !== 1 ? 's' : ''}
                  </span>
                  <Link
                    href={`/admin/inventory/${tree.id}`}
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: 13,
                      color: 'var(--forest)',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    View →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
