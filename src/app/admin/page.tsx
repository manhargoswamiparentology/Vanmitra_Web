import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function AdminOverviewPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalBookings, totalInventory, freeInventory, allocatedInventory, totalUsers, recentUpdates] =
    await Promise.all([
      prisma.dedication.count({ where: { status: 'CONFIRMED' } }),
      prisma.inventoryTree.count(),
      prisma.inventoryTree.count({ where: { status: 'FREE' } }),
      prisma.inventoryTree.count({ where: { status: 'ALLOCATED' } }),
      prisma.user.count(),
      prisma.treeUpdate.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          tree: {
            include: {
              dedication: { select: { id: true, recipientName: true } },
            },
          },
        },
      }),
    ])

  const dedicationsThisMonth = await prisma.dedication.count({
    where: { createdAt: { gte: startOfMonth } },
  })

  const stats = [
    { label: 'Total Bookings', value: totalBookings, color: 'var(--forest)', href: '/admin/trees' },
    { label: 'Trees in Inventory', value: totalInventory, color: 'var(--terra)', href: '/admin/inventory' },
    { label: 'Available Trees', value: freeInventory, color: 'var(--moss)', href: '/admin/inventory?status=FREE' },
    { label: 'Booked This Month', value: dedicationsThisMonth, color: 'var(--gold)', href: '/admin/trees' },
  ]

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Admin</div>
        <h2 style={{ fontSize: 32, fontWeight: 500, marginBottom: 8 }}>Overview</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
          Welcome back. Here&apos;s what&apos;s happening on the platform.
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
            <div
              className="card"
              style={{ padding: '24px 20px', borderTop: `3px solid ${stat.color}`, cursor: 'pointer' }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontFamily: 'var(--display)',
                  fontWeight: 600,
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                }}
              >
                {stat.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent activity */}
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
            Recent Updates
          </div>

          {recentUpdates.length === 0 ? (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14, fontStyle: 'italic' }}>
              No updates yet.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {recentUpdates.map((update, idx) => {
                const dedication = update.tree.dedication
                return (
                  <div key={update.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Link
                        href={dedication ? `/admin/trees/${dedication.id}` : '/admin/inventory'}
                        style={{
                          fontFamily: 'var(--display)',
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--forest)',
                          textDecoration: 'none',
                        }}
                      >
                        {dedication?.recipientName || update.tree.uniqueId}
                      </Link>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 10,
                          color: 'var(--ink-mute)',
                          flexShrink: 0,
                        }}
                      >
                        {new Date(update.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--ink-soft)',
                        fontStyle: 'italic',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {update.message}
                    </p>
                    {idx < recentUpdates.length - 1 && (
                      <hr className="dotted-rule" style={{ margin: '12px 0 0' }} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
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
            Quick Actions
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { href: '/admin/trees', label: 'View bookings', desc: 'Send photos & updates to users' },
              { href: '/admin/inventory', label: 'Manage inventory', desc: 'Add trees, view & edit stock' },
              { href: '/admin/inventory/new', label: 'Add trees to inventory', desc: 'Single or bulk add physical trees' },
              { href: '/admin/users', label: 'Manage users', desc: 'View all users & admin access' },
              { href: '/admin/blog/new', label: 'Write a blog post', desc: 'Publish to the Vanamitra blog' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                  textDecoration: 'none',
                  background: 'var(--paper)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--display)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--forest)',
                    marginBottom: 2,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
