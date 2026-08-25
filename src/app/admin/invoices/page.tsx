import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SPECIES, OCCASIONS } from '@/data/constants'

export default async function AdminInvoicesPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const dedications = await prisma.dedication.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      status: true,
      occasionId: true,
      recipientName: true,
      corporateName: true,
      employeeEmail: true,
      user: { select: { name: true, email: true } },
      tree: { select: { uniqueId: true, speciesId: true, price: true } },
    },
  })

  // Summary stats
  const confirmed = dedications.filter(d => d.status === 'CONFIRMED')
  const totalRevenue = confirmed.reduce((sum, d) => sum + (d.tree.price ?? 500), 0)
  const now = new Date()
  const thisMonthRevenue = confirmed
    .filter(d => {
      const created = new Date(d.createdAt)
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    })
    .reduce((sum, d) => sum + (d.tree.price ?? 500), 0)

  function statusColor(s: string) {
    if (s === 'CONFIRMED') return 'var(--forest)'
    if (s === 'CANCELLED') return 'var(--terra)'
    return 'var(--ink-mute)'
  }

  function statusBg(s: string) {
    if (s === 'CONFIRMED') return 'color-mix(in oklch, var(--forest) 10%, var(--paper))'
    if (s === 'CANCELLED') return 'color-mix(in oklch, var(--terra) 10%, var(--paper))'
    return 'var(--paper-2)'
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Admin / Invoices</div>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Invoices & Revenue</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
          All purchase invoices. Use this for bookkeeping and accounting.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'Total revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, note: `${confirmed.length} confirmed orders`, color: 'var(--forest)' },
          { label: 'This month', value: `₹${thisMonthRevenue.toLocaleString('en-IN')}`, note: now.toLocaleString('en-IN', { month: 'long', year: 'numeric' }), color: 'var(--moss)' },
          { label: 'Total orders', value: String(dedications.length), note: `${dedications.filter(d => d.status === 'PENDING').length} pending`, color: 'var(--terra)' },
          { label: 'Avg order value', value: confirmed.length ? `₹${Math.round(totalRevenue / confirmed.length).toLocaleString('en-IN')}` : '—', note: 'per confirmed order', color: 'var(--ink-mute)' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '18px 20px',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>
              {card.label}
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 600, color: card.color, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {card.value}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' }}>
              {card.note}
            </div>
          </div>
        ))}
      </div>

      {/* Invoices table */}
      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '130px 110px 1fr 120px 100px 80px 90px 80px',
          gap: 12,
          padding: '12px 20px',
          background: 'var(--paper-2)',
          borderBottom: '1px solid var(--line)',
        }}>
          {['Invoice #', 'Date', 'Buyer', 'Recipient', 'Species', 'Tree ID', 'Amount', 'Status'].map(h => (
            <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {dedications.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-mute)' }}>
            No dedications yet.
          </div>
        )}
        {dedications.map((d, i) => {
          const shortId = d.id.slice(-8).toUpperCase()
          const invoiceNo = `INV-${shortId}`
          const species = SPECIES.find(s => s.id === d.tree.speciesId)
          const occasion = OCCASIONS.find(o => o.id === d.occasionId)
          const price = d.tree.price ?? 500
          const dateStr = new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })

          return (
            <div
              key={d.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 110px 1fr 120px 100px 80px 90px 80px',
                gap: 12,
                padding: '13px 20px',
                borderBottom: i < dedications.length - 1 ? '1px solid var(--line)' : 'none',
                alignItems: 'center',
                transition: 'background 120ms',
              }}
            >
              {/* Invoice # */}
              <Link
                href={`/dedications/${d.id}`}
                style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--forest)', letterSpacing: '0.04em', textDecoration: 'none', fontWeight: 600 }}
              >
                {invoiceNo}
              </Link>

              {/* Date */}
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
                {dateStr}
              </div>

              {/* Buyer */}
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                  {d.user.name}
                  {d.corporateName && (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--forest)', letterSpacing: '0.06em', marginLeft: 6 }}>
                      🏢 {d.corporateName}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 1 }}>
                  {d.user.email}
                </div>
              </div>

              {/* Recipient */}
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)' }}>{d.recipientName}</div>
                {d.employeeEmail && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)' }}>{d.employeeEmail}</div>
                )}
              </div>

              {/* Species */}
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 12, fontWeight: 500, color: 'var(--moss)' }}>{species?.name ?? d.tree.speciesId}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-mute)' }}>{occasion?.title}</div>
              </div>

              {/* Tree ID */}
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.04em' }}>
                {d.tree.uniqueId}
              </div>

              {/* Amount */}
              <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                ₹{price.toLocaleString('en-IN')}
              </div>

              {/* Status */}
              <div>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: statusColor(d.status),
                  background: statusBg(d.status),
                  border: `1px solid ${statusColor(d.status)}33`,
                  padding: '3px 8px', borderRadius: 999,
                }}>
                  {d.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Accounting footer */}
      {dedications.length > 0 && (
        <div style={{
          marginTop: 20,
          padding: '16px 20px',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-mute)' }}>
            {confirmed.length} confirmed order{confirmed.length !== 1 ? 's' : ''} · {dedications.filter(d => d.status === 'PENDING').length} pending · {dedications.filter(d => d.status === 'CANCELLED').length} cancelled
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, color: 'var(--forest)', letterSpacing: '-0.01em' }}>
              Total confirmed: ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Bookkeeping note */}
      <div style={{
        marginTop: 20,
        padding: '16px 20px',
        background: 'color-mix(in oklch, var(--forest) 5%, var(--paper))',
        border: '1px solid color-mix(in oklch, var(--forest) 15%, var(--line))',
        borderRadius: 12,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 8 }}>
          Accounting Notes
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'HSN / SAC Code', value: '0201 — Live trees and other plants', note: 'Tree planting / environmental services' },
            { label: 'GST Rate', value: '5% (if applicable)', note: 'Verify with your CA — services may vary' },
            { label: 'Payment mode', value: 'To be added', note: 'Payment gateway integration pending' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>
                {item.value}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink-mute)' }}>
                {item.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
