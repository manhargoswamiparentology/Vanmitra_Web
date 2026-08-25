import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SPECIES } from '@/data/constants'

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the deadline for the next photo update.
 * Rule: photos due in the first week (by the 7th) of every month.
 * Given the last event date (dedication or last update), the next
 * due date is the 7th of the following month.
 */
function nextDueDate(lastEventDate: Date): Date {
  const d = new Date(lastEventDate)
  // Move to 1st of next month, then set day to 7
  return new Date(d.getFullYear(), d.getMonth() + 1, 7)
}

function daysFromNow(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function AdminRemindersPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  // Fetch all allocated trees with their dedication + latest update
  const trees = await prisma.inventoryTree.findMany({
    where: { status: 'ALLOCATED' },
    orderBy: { addedAt: 'desc' },
    include: {
      dedication: {
        select: {
          id: true,
          createdAt: true,
          recipientName: true,
          occasionId: true,
          employeePhone: true,
          employeeEmail: true,
          user: { select: { name: true, email: true } },
        },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: { select: { updates: true } },
    },
  })

  // Compute reminder state for each tree
  const now = new Date()

  const rows = trees
    .filter(t => t.dedication !== null)
    .map(t => {
      const dedication = t.dedication!
      const lastUpdate = t.updates[0] ?? null
      const lastEvent = lastUpdate ? new Date(lastUpdate.createdAt) : new Date(dedication.createdAt)
      const due = nextDueDate(lastEvent)
      const days = daysFromNow(due)
      const species = SPECIES.find(s => s.id === t.speciesId)

      let urgency: 'overdue' | 'due-soon' | 'ok'
      if (days < 0) urgency = 'overdue'
      else if (days <= 7) urgency = 'due-soon'
      else urgency = 'ok'

      return { tree: t, dedication, lastUpdate, due, days, urgency, species, updateCount: t._count.updates }
    })
    .sort((a, b) => a.days - b.days) // most urgent first

  const overdue  = rows.filter(r => r.urgency === 'overdue')
  const dueSoon  = rows.filter(r => r.urgency === 'due-soon')
  const upToDate = rows.filter(r => r.urgency === 'ok')

  function UrgencyBadge({ urgency, days }: { urgency: string; days: number }) {
    const map = {
      overdue:  { bg: 'color-mix(in oklch, var(--terra) 15%, var(--paper))',  color: 'var(--terra-deep)',  label: `${Math.abs(days)}d overdue` },
      'due-soon': { bg: 'color-mix(in oklch, var(--gold) 20%, var(--paper))', color: '#b07800',            label: days === 0 ? 'Due today' : `Due in ${days}d` },
      ok:       { bg: 'color-mix(in oklch, var(--moss) 12%, var(--paper))',   color: 'var(--moss)',        label: `Due in ${days}d` },
    } as const
    const s = map[urgency as keyof typeof map] ?? map.ok
    return (
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
        background: s.bg, color: s.color,
        border: `1px solid ${s.color}44`,
        padding: '3px 9px', borderRadius: 999, fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        {s.label}
      </span>
    )
  }

  function TreeRow({ r }: { r: typeof rows[0] }) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '110px 1fr 1fr 100px 110px 80px 90px',
        gap: 12, padding: '13px 20px', alignItems: 'center',
        borderBottom: '1px solid var(--line)',
      }}>
        {/* Tree ID */}
        <Link href={`/admin/inventory/${r.tree.id}`}
          style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--forest)', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.04em' }}>
          {r.tree.uniqueId}
        </Link>

        {/* Recipient + buyer */}
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
            {r.dedication.recipientName}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 1 }}>
            Buyer: {r.dedication.user.name}
          </div>
        </div>

        {/* Species + dedicated date */}
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 12, fontWeight: 500, color: 'var(--moss)' }}>
            {r.species?.name ?? r.tree.speciesId}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 1 }}>
            Dedicated {fmtDate(r.dedication.createdAt)}
          </div>
        </div>

        {/* Updates count */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 600, color: r.updateCount === 0 ? 'var(--terra)' : 'var(--forest)' }}>
            {r.updateCount}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-mute)' }}>
            {r.updateCount === 1 ? 'update' : 'updates'}
          </div>
        </div>

        {/* Last update */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' }}>
          {r.lastUpdate ? fmtDate(new Date(r.lastUpdate.createdAt)) : <span style={{ fontStyle: 'italic', color: 'var(--terra)' }}>None yet</span>}
        </div>

        {/* Due date */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' }}>
          {fmtDate(r.due)}
        </div>

        {/* Urgency badge + action */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <UrgencyBadge urgency={r.urgency} days={r.days} />
          <Link href={`/admin/inventory/${r.tree.id}`}
            style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', color: 'var(--forest)', textDecoration: 'none' }}>
            Post update →
          </Link>
        </div>
      </div>
    )
  }

  function Section({ title, items, accent }: { title: string; items: typeof rows; accent: string }) {
    if (items.length === 0) return null
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: accent, flexShrink: 0, display: 'inline-block' }} />
          <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em' }}>
            {items.length} tree{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', background: 'var(--paper)' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr 1fr 100px 110px 80px 90px',
            gap: 12, padding: '10px 20px',
            background: 'var(--paper-2)', borderBottom: '1px solid var(--line)',
          }}>
            {['Tree ID', 'Recipient', 'Species / Date', 'Updates', 'Last update', 'Next due', 'Status'].map(h => (
              <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                {h}
              </div>
            ))}
          </div>
          {items.map(r => <TreeRow key={r.tree.id} r={r} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Admin / Reminders</div>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Photo Update Reminders</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15, maxWidth: 560 }}>
          Every allocated tree needs a photo update in the first week of each month.
          If someone buys on 10 March, their first update is due by 7 April.
        </p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'Overdue', count: overdue.length, color: 'var(--terra)', note: 'Past the 7th, no update posted' },
          { label: 'Due this week', count: dueSoon.length, color: '#b07800', note: 'Update needed within 7 days' },
          { label: 'Up to date', count: upToDate.length, color: 'var(--forest)', note: 'No action needed yet' },
        ].map(c => (
          <div key={c.label} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '18px 20px', background: 'var(--paper)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>
              {c.label}
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 600, color: c.color, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {c.count}
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-mute)' }}>
              {c.note}
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div style={{ border: '2px dashed var(--line)', borderRadius: 14, padding: '56px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: 15 }}>
            No allocated trees yet. Reminders will appear here once users start planting.
          </p>
        </div>
      ) : (
        <>
          <Section title="Overdue — post update now" items={overdue} accent="var(--terra)" />
          <Section title="Due this week — action soon" items={dueSoon} accent="#b07800" />
          <Section title="Up to date" items={upToDate} accent="var(--moss)" />
        </>
      )}

      {/* How this works */}
      <div style={{
        marginTop: 16, padding: '16px 20px',
        background: 'color-mix(in oklch, var(--forest) 5%, var(--paper))',
        border: '1px solid color-mix(in oklch, var(--forest) 15%, var(--line))',
        borderRadius: 12,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 8 }}>
          Update Schedule Logic
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'Purchase date', value: 'e.g. 10 March', note: 'Tree allocated to user' },
            { label: 'First update due', value: 'By 7 April', note: '7th of the following month' },
            { label: 'Ongoing updates', value: 'By 7th every month', note: 'Until tree reaches maturity' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{item.value}</div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-mute)' }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
