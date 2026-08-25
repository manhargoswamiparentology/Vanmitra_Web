import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

interface BadgeRow {
  id: string
  key: string
  name: string
  description: string
  tier: BadgeTier
  icon: string
  treesRequired: number | null
  streakRequired: number | null
}

interface UserBadgeRow {
  id: string
  userId: string
  badgeId: string
  earnedAt: Date
  progress: number
  badge: BadgeRow
}

interface NoteRow {
  createdAt: Date
}

const TIER_COLOR: Record<BadgeTier, string> = {
  BRONZE: 'oklch(0.58 0.08 50)',
  SILVER: 'oklch(0.62 0.02 220)',
  GOLD: 'oklch(0.78 0.10 80)',
  PLATINUM: 'oklch(0.40 0.07 150)',
}

const TIER_BG: Record<BadgeTier, string> = {
  BRONZE: 'oklch(0.92 0.04 50)',
  SILVER: 'oklch(0.92 0.01 220)',
  GOLD: 'oklch(0.95 0.06 80)',
  PLATINUM: 'oklch(0.88 0.04 150)',
}

const TIER_LABEL: Record<BadgeTier, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
}

interface BadgeMedalProps {
  icon: string
  name: string
  tier: BadgeTier
  earnedAt?: Date
  progress?: number
  earned: boolean
  size?: 'sm' | 'lg'
}

function BadgeMedal({ icon, name, tier, earnedAt, progress, earned, size = 'sm' }: BadgeMedalProps) {
  const dim = size === 'lg' ? 76 : 56
  const iconSize = size === 'lg' ? 28 : 22
  const color = TIER_COLOR[tier]
  const bg = TIER_BG[tier]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        opacity: earned ? 1 : 0.45,
      }}
    >
      <div
        style={{
          width: dim,
          height: dim,
          borderRadius: '50%',
          background: earned ? bg : 'var(--paper-3)',
          border: `3px solid ${earned ? color : 'var(--line)'}`,
          display: 'grid',
          placeItems: 'center',
          fontSize: iconSize,
          position: 'relative',
        }}
      >
        {icon}
        {!earned && progress !== undefined && progress > 0 && (
          <svg
            style={{ position: 'absolute', inset: -3, width: dim + 6, height: dim + 6 }}
            viewBox={`0 0 ${dim + 6} ${dim + 6}`}
          >
            <circle
              cx={(dim + 6) / 2}
              cy={(dim + 6) / 2}
              r={(dim - 4) / 2}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeDasharray={Math.PI * (dim - 4)}
              strokeDashoffset={Math.PI * (dim - 4) * (1 - progress / 100)}
              strokeLinecap="round"
              transform={`rotate(-90 ${(dim + 6) / 2} ${(dim + 6) / 2})`}
              style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1)' }}
            />
          </svg>
        )}
      </div>

      <div style={{ textAlign: 'center', maxWidth: 90 }}>
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--ink)',
            lineHeight: 1.2,
            marginBottom: 3,
          }}
        >
          {name}
        </div>
        {earned && earnedAt ? (
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: color,
            }}
          >
            {earnedAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </div>
        ) : (
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
            }}
          >
            {progress !== undefined ? `${progress}%` : 'Locked'}
          </div>
        )}
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 8,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: earned ? color : 'var(--line)',
            marginTop: 2,
          }}
        >
          {TIER_LABEL[tier]}
        </div>
      </div>
    </div>
  )
}

export default async function BadgesPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const [userBadges, allBadges, treeCount, noteCount, visitCount] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId: session.userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    }) as Promise<UserBadgeRow[]>,
    prisma.badge.findMany({ orderBy: [{ tier: 'asc' }, { name: 'asc' }] }) as Promise<BadgeRow[]>,
    prisma.dedication.count({ where: { userId: session.userId } }),
    prisma.note.count({ where: { userId: session.userId } }),
    prisma.visit.count({ where: { userId: session.userId } }),
  ])

  const earnedBadgeIds = new Set(userBadges.map((ub: { badgeId: string }) => ub.badgeId))

  function getBadgeProgress(badge: typeof allBadges[number]): number {
    if (earnedBadgeIds.has(badge.id)) return 100
    if (badge.treesRequired) {
      return Math.min(100, Math.round((treeCount / badge.treesRequired) * 100))
    }
    if (badge.streakRequired) {
      return Math.min(100, Math.round((noteCount / badge.streakRequired) * 100))
    }
    return 0
  }

  const earned = allBadges.filter((b: BadgeRow) => earnedBadgeIds.has(b.id))
  const inProgress = allBadges.filter((b: BadgeRow) => !earnedBadgeIds.has(b.id))

  // Streak months: distinct year-months with activity
  const notes = await prisma.note.findMany({
    where: { userId: session.userId },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
  }) as NoteRow[]
  const months = new Set(notes.map((n: NoteRow) => n.createdAt.toISOString().slice(0, 7)))
  const streakMonths = months.size

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Streak hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--terra) 0%, var(--terra-deep) 100%)',
          borderRadius: 20,
          padding: '32px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'oklch(1 0 0 / 0.06)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ fontSize: 52, lineHeight: 1 }}>🔥</div>
        <div>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'oklch(1 0 0 / 0.7)',
              marginBottom: 6,
            }}
          >
            Activity streak
          </div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 500,
              color: 'var(--paper)',
              lineHeight: 1.1,
            }}
          >
            Active streak{' '}
            <strong style={{ fontWeight: 700 }}>
              {streakMonths} month{streakMonths !== 1 ? 's' : ''}
            </strong>{' '}
            in a row
          </div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 14,
              color: 'oklch(1 0 0 / 0.75)',
              marginTop: 6,
            }}
          >
            Keep adding notes and visits to maintain your streak.
          </div>
        </div>
      </div>

      {/* Stats context */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Trees planted', value: treeCount, icon: '🌳' },
          { label: 'Notes written', value: noteCount, icon: '📝' },
          { label: 'Visits made', value: visitCount, icon: '🗓' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <div
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 24,
                  fontWeight: 600,
                  color: 'var(--forest)',
                  lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                {s.value}
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
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 18,
            }}
          >
            Earned badges ({earned.length})
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            {earned.map((badge: BadgeRow) => {
              const ub = userBadges.find((u: UserBadgeRow) => u.badgeId === badge.id)
              return (
                <BadgeMedal
                  key={badge.id}
                  icon={badge.icon}
                  name={badge.name}
                  tier={badge.tier}
                  earnedAt={ub?.earnedAt}
                  earned={true}
                  size="lg"
                />
              )
            })}
          </div>
        </div>
      )}

      {/* In-progress badges */}
      {inProgress.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 18,
            }}
          >
            In progress ({inProgress.length})
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            {inProgress.map((badge: BadgeRow) => (
              <BadgeMedal
                key={badge.id}
                icon={badge.icon}
                name={badge.name}
                tier={badge.tier}
                progress={getBadgeProgress(badge)}
                earned={false}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {allBadges.length === 0 && (
        <div
          style={{
            border: '2px dashed var(--line)',
            borderRadius: 16,
            padding: '48px 40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div style={{ fontSize: 44 }}>🏅</div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 20,
              fontWeight: 500,
              color: 'var(--ink)',
            }}
          >
            Badges coming soon
          </div>
          <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', maxWidth: 360 }}>
            Earn badges as you plant trees, write notes, and visit the farm.
          </p>
        </div>
      )}
    </div>
  )
}
