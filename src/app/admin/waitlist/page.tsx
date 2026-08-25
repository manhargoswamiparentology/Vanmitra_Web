import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function AdminWaitlistPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ marginBottom: 4 }}>Waitlist</h3>
        <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', fontSize: 15 }}>
          {entries.length} {entries.length === 1 ? 'person' : 'people'} waiting for trees to become available.
        </p>
      </div>

      {entries.length === 0 ? (
        <div style={{
          border: '2px dashed var(--line)',
          borderRadius: 16,
          padding: '48px',
          textAlign: 'center',
          color: 'var(--ink-mute)',
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
        }}>
          No waitlist entries yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--ink-mute)',
                letterSpacing: '0.06em',
                minWidth: 28,
                paddingTop: 2,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                    {entry.name || '—'}
                  </span>
                  <a
                    href={`mailto:${entry.email}`}
                    style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--forest)', textDecoration: 'none', letterSpacing: '0.04em' }}
                  >
                    {entry.email}
                  </a>
                </div>
                {entry.note && (
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
                    "{entry.note}"
                  </p>
                )}
              </div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: 'var(--ink-mute)',
                letterSpacing: '0.06em',
                flexShrink: 0,
                paddingTop: 2,
              }}>
                {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
