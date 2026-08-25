import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import EnquiryStatusButton from './EnquiryStatusButton'

export default async function AdminEnquiriesPage() {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  const enquiries = await prisma.corporateEnquiry.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const newCount     = enquiries.filter(e => e.status === 'new').length
  const readCount    = enquiries.filter(e => e.status === 'read').length
  const repliedCount = enquiries.filter(e => e.status === 'replied').length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Admin / Enquiries</div>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Corporate Enquiries</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
          Leads from the Corporate page enquiry form.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'New',     count: newCount,     color: 'var(--terra)',  note: 'Not yet reviewed' },
          { label: 'Read',    count: readCount,    color: '#8a6000',       note: 'Seen, pending reply' },
          { label: 'Replied', count: repliedCount, color: 'var(--forest)', note: 'Responded to' },
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

      {/* Table */}
      {enquiries.length === 0 ? (
        <div style={{ border: '2px dashed var(--line)', borderRadius: 14, padding: '56px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: 15 }}>
            No enquiries yet. They'll appear here as soon as someone fills the corporate form.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
          {enquiries.map((e, i) => (
            <div
              key={e.id}
              style={{
                padding: '20px 24px',
                borderBottom: i < enquiries.length - 1 ? '1px solid var(--line)' : 'none',
                background: e.status === 'new' ? 'color-mix(in oklch, var(--terra) 3%, var(--paper))' : 'var(--paper)',
              }}
            >
              {/* Row 1: company + date + status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                      {e.company}
                    </span>
                    {e.status === 'new' && (
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase',
                        background: 'var(--terra)', color: 'var(--paper)',
                        padding: '2px 7px', borderRadius: 999, fontWeight: 700,
                      }}>
                        New
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 3 }}>
                    {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}
                    {new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <EnquiryStatusButton id={e.id} initial={e.status as 'new' | 'read' | 'replied'} />
              </div>

              {/* Row 2: contact details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px 20px', marginBottom: e.message ? 12 : 0 }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 3 }}>
                    Contact
                  </div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                    {e.contact}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 3 }}>
                    Email
                  </div>
                  <a
                    href={`mailto:${e.email}`}
                    style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--forest)', textDecoration: 'none' }}
                  >
                    {e.email}
                  </a>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 3 }}>
                    Phone
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)' }}>
                    {e.phone || <span style={{ color: 'var(--ink-mute)', fontStyle: 'italic' }}>—</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 3 }}>
                    Team size
                  </div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: 'var(--moss)' }}>
                    {e.employees || <span style={{ color: 'var(--ink-mute)', fontWeight: 400, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>—</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 3 }}>
                    Occasion
                  </div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 500, color: 'var(--terra)' }}>
                    {e.occasion || <span style={{ color: 'var(--ink-mute)', fontWeight: 400, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>—</span>}
                  </div>
                </div>
              </div>

              {/* Message */}
              {e.message && (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--paper-2)',
                  borderLeft: '3px solid var(--line)',
                  borderRadius: '0 8px 8px 0',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>
                    Message
                  </div>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                    {e.message}
                  </p>
                </div>
              )}

              {/* Quick reply link */}
              <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                <a
                  href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: Vanamitra Corporate Tree Gifting — ${e.company}`)}&body=${encodeURIComponent(`Hi ${e.contact},\n\nThank you for reaching out about Vanamitra's corporate tree gifting programme.\n\n`)}`}
                  style={{
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
                    color: 'var(--forest)', textDecoration: 'none',
                    background: 'color-mix(in oklch, var(--forest) 8%, var(--paper))',
                    border: '1px solid color-mix(in oklch, var(--forest) 20%, var(--line))',
                    padding: '5px 12px', borderRadius: 8,
                  }}
                >
                  Reply via email →
                </a>
                {e.phone && (
                  <a
                    href={`https://wa.me/${e.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${e.contact}, this is from Vanamitra regarding your corporate enquiry.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
                      color: 'var(--moss)', textDecoration: 'none',
                      background: 'color-mix(in oklch, var(--moss) 8%, var(--paper))',
                      border: '1px solid color-mix(in oklch, var(--moss) 20%, var(--line))',
                      padding: '5px 12px', borderRadius: 8,
                    }}
                  >
                    WhatsApp →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
