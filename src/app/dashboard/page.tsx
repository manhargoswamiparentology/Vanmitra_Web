import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface NoteRow { id: string; title: string; body: string; mood: string; createdAt: Date }

export default async function DashboardHome() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const [dedications, giftsReceived, userBadges, recentNotes, latestUpdate] = await Promise.all([
    prisma.dedication.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    }),
    // Trees gifted TO this user by someone else (matched by their email)
    prisma.dedication.findMany({
      where: {
        employeeEmail: session.email,
        userId: { not: session.userId }, // exclude own purchases
        status: 'CONFIRMED',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        tree: { select: { uniqueId: true, speciesId: true, locationAddress: true } },
      },
    }),
    prisma.userBadge.findMany({
      where: { userId: session.userId },
      include: { badge: true },
    }) as Promise<{ id: string; badgeId: string }[]>,
    prisma.note.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }) as Promise<NoteRow[]>,
    prisma.treeUpdate.findFirst({
      where: {
        tree: {
          dedication: { userId: session.userId },
        },
      },
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

  const treeCount = dedications.length
  const badgeCount = userBadges.length
  const co2Kg = treeCount * 24
  const noTrees = treeCount === 0

  const months = new Set(recentNotes.map((n: NoteRow) => n.createdAt.toISOString().slice(0, 7)))
  const streakMonths = months.size

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const moodAccent: Record<string, string> = {
    JOY: 'var(--gold)',
    REFLECTION: 'var(--moss)',
    ANTICIPATION: 'var(--terra)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Greeting hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-deep) 100%)',
          borderRadius: 20,
          padding: '36px 36px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'oklch(1 0 0 / 0.04)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'oklch(0.85 0.05 150)',
            marginBottom: 10,
          }}
        >
          Welcome back, {session.name.split(' ')[0]} · {today}
        </div>
        <h3 style={{ color: 'var(--paper)', fontSize: 'clamp(22px, 2.6vw, 34px)', marginBottom: 24 }}>
          {noTrees
            ? 'Your forest is waiting to begin.'
            : `Your forest is ${treeCount} tree${treeCount !== 1 ? 's' : ''} tall.`}
        </h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/plant" className="btn btn-terra btn-sm">
            Plant a tree
          </Link>
          {!noTrees && (
            <Link
              href="/dashboard/trees"
              className="btn btn-ghost btn-sm"
              style={{ borderColor: 'oklch(1 0 0 / 0.3)', color: 'var(--paper)' }}
            >
              See progress
            </Link>
          )}
        </div>
      </div>

      {/* No trees empty state */}
      {noTrees && (
        <div
          style={{
            border: '2px dashed var(--line)',
            borderRadius: 18,
            padding: '48px 36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 48 }}>🌱</div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
              Your forest starts with one tree
            </div>
            <div style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', maxWidth: 400 }}>
              Plant a tree in someone&apos;s name on our Kheda farm. It grows, gets photographed monthly,
              and lives on your dashboard forever.
            </div>
          </div>
          <Link href="/plant" className="btn btn-primary">
            Plant your first tree →
          </Link>
        </div>
      )}

      {/* Stat strip */}
      {!noTrees && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { label: 'Total trees', value: treeCount, color: 'var(--forest)', icon: '🌳' },
            { label: 'Streak months', value: streakMonths, color: 'var(--terra)', icon: '🔥' },
            { label: 'Badges earned', value: badgeCount, color: 'var(--gold)', icon: '🏅' },
            { label: 'CO₂ offset kg', value: co2Kg, color: 'var(--moss)', icon: '🍃' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '20px 20px 18px' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
              <div
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 28,
                  fontWeight: 600,
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: 4,
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Latest update from admin */}
      {latestUpdate && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink-mute)',
              }}
            >
              Latest update · {latestUpdate.tree.dedication?.recipientName || latestUpdate.tree.uniqueId}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.06em' }}>
              {new Date(latestUpdate.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 0 }}>
            {latestUpdate.photoUrl ? (
              <img
                src={`/api/blob?url=${encodeURIComponent(latestUpdate.photoUrl!)}`}
                alt="Tree update"
                style={{ width: 160, height: 140, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div className="photo-ph" style={{ width: 160, height: 140, flexShrink: 0 }}>
                <span>No photo</span>
              </div>
            )}
            <div style={{ padding: '20px 22px', flex: 1 }}>
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'var(--ink)',
                  lineHeight: 1.55,
                  borderLeft: '3px solid var(--terra)',
                  paddingLeft: 14,
                }}
              >
                {latestUpdate.message}
              </p>
              {latestUpdate.tree.dedication && (
                <Link
                  href={`/dashboard/trees?tree=${latestUpdate.tree.dedication.id}`}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--moss)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 14,
                  }}
                >
                  View tree →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trees gifted to me */}
      {giftsReceived.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>
                Trees gifted to you 🎁
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-mute)' }}>
                Someone planted these in your name
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {giftsReceived.map((gift: {
              id: string
              recipientName: string
              recipientFrom: string | null
              shareToken: string | null
              createdAt: Date
              user: { name: string }
              tree: { uniqueId: string; speciesId: string; locationAddress: string | null }
            }) => (
              <div key={gift.id} className="card" style={{ padding: '18px 20px', borderTop: '3px solid var(--gold)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>
                  Gift from {gift.user.name}
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                  {gift.recipientName}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--forest)', marginBottom: 4 }}>
                  {gift.tree.uniqueId} · {gift.tree.speciesId}
                </div>
                {gift.tree.locationAddress && (
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 12, color: 'var(--ink-mute)', marginBottom: 8, fontStyle: 'italic' }}>
                    {gift.tree.locationAddress}
                  </div>
                )}
                {gift.recipientFrom && (
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12 }}>
                    &ldquo;{gift.recipientFrom}&rdquo;
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link
                    href={`/dedications/${gift.id}`}
                    style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--forest)', textDecoration: 'none', letterSpacing: '0.06em' }}
                  >
                    View details →
                  </Link>
                  {gift.shareToken && (
                    <Link
                      href={`/certificate/${gift.shareToken}`}
                      style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--terra)', textDecoration: 'none', letterSpacing: '0.06em' }}
                    >
                      Certificate →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent notes */}
      {recentNotes.length > 0 && (
        <div>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}
          >
            <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>
              Recent notes
            </div>
            <Link
              href="/dashboard/notes"
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--moss)',
                textDecoration: 'none',
              }}
            >
              All notes →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {recentNotes.map((note: NoteRow) => (
              <div
                key={note.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden', borderTop: `3px solid ${moodAccent[note.mood]}` }}
              >
                <div style={{ padding: '16px 18px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-mute)',
                      marginBottom: 8,
                    }}
                  >
                    {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div
                    style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.2 }}
                  >
                    {note.title}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: 'var(--ink-soft)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {note.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
