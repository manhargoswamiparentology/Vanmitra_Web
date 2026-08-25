import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { dedications: true } },
    },
  })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Admin / Users</div>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Users</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
          {users.length} registered user{users.length !== 1 ? 's' : ''}.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
            fontFamily: 'var(--display)',
          }}
        >
          <thead>
            <tr style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
              {['Name', 'Email', 'City', 'Trees', 'Role', 'Joined', 'Actions'].map((col) => (
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
            {users.map((user: { id: string; name: string; email: string; city: string | null; isAdmin: boolean; createdAt: Date; _count: { dedications: number } }, i: number) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: '1px solid var(--line)',
                  background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-2)',
                }}
              >
                <td
                  style={{
                    padding: '12px 14px',
                    fontWeight: 500,
                    color: 'var(--ink)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    color: 'var(--ink-soft)',
                    fontSize: 13,
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    color: 'var(--ink-mute)',
                    fontSize: 13,
                  }}
                >
                  {user.city || '—'}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--forest)',
                    fontWeight: 500,
                  }}
                >
                  {user._count.dedications}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {user.isAdmin ? (
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
                        background: 'color-mix(in oklch, var(--forest) 12%, var(--paper))',
                        color: 'var(--forest)',
                        fontWeight: 500,
                      }}
                    >
                      Admin
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-mute)',
                      }}
                    >
                      User
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--ink-mute)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: '2-digit',
                  })}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <form
                    action={`/api/admin/users/${user.id}/toggle-admin`}
                    method="POST"
                    style={{ display: 'inline' }}
                  >
                    <Link
                      href={`/api/admin/users/${user.id}/toggle-admin`}
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: '6px 14px',
                        fontSize: 12,
                        textDecoration: 'none',
                        opacity: user.id === session.userId ? 0.4 : 1,
                        pointerEvents: user.id === session.userId ? 'none' : 'auto',
                      }}
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </Link>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--ink-mute)',
            fontStyle: 'italic',
          }}
        >
          No users found.
        </div>
      )}
    </div>
  )
}
