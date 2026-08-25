import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import LogVisitForm from './LogVisitForm'

interface VisitRow {
  id: string
  visitDate: Date
  duration: string | null
  companions: string | null
  note: string | null
}

const FARM_ADDRESS = 'Vasna village, Kheda district, Gujarat — 55 km from Ahmedabad'
const FARM_GPS = '22.7433° N, 72.6850° E'
const FARM_WHATSAPP = '919876543210' // placeholder

export default async function VisitsPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const visits = await prisma.visit.findMany({
    where: { userId: session.userId },
    orderBy: { visitDate: 'desc' },
  }) as VisitRow[]

  const planMsg = encodeURIComponent(
    `Hi Vanamitra team! I'd like to plan a visit to the farm to see my tree. My name is ${session.name}. Could you help me with the details?`
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h3 style={{ marginBottom: 6 }}>Visits</h3>
        <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', fontSize: 15 }}>
          Come see your tree. The farm is open every Saturday.
        </p>
      </div>

      {/* Farm info card */}
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-deep) 100%)',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'oklch(0.85 0.05 150)',
                marginBottom: 8,
              }}
            >
              Vanamitra Farm
            </div>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--paper)',
                marginBottom: 4,
              }}
            >
              Open every Saturday
            </div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 14,
                color: 'oklch(0.85 0.02 150)',
              }}
            >
              8 am – 5 pm · Chai provided
            </div>
          </div>
          <a
            href={`https://wa.me/${FARM_WHATSAPP}?text=${planMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-terra btn-sm"
            style={{ flexShrink: 0 }}
          >
            Plan a visit
          </a>
        </div>

        <div
          style={{
            padding: '20px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
        >
          {[
            { icon: '📍', label: 'Address', value: FARM_ADDRESS },
            { icon: '🗺', label: 'GPS', value: FARM_GPS },
            { icon: '📞', label: 'WhatsApp', value: 'Message to plan your visit' },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                  marginBottom: 6,
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  color: 'var(--ink)',
                  lineHeight: 1.4,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log a visit */}
      <LogVisitForm />

      {/* Past visits */}
      <div>
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--ink)',
            marginBottom: 14,
          }}
        >
          {visits.length > 0 ? `Past visits (${visits.length})` : 'Past visits'}
        </div>

        {visits.length === 0 ? (
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
            <div style={{ fontSize: 44 }}>🌿</div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 20,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: 8,
                }}
              >
                No visits yet
              </div>
              <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', maxWidth: 360 }}>
                The farm is open every Saturday. Come see your tree — bring water, we'll have chai.
              </p>
            </div>
            <a
              href={`https://wa.me/${FARM_WHATSAPP}?text=${planMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Plan your first visit →
            </a>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.04em' }}>
              Already visited? Use the <strong>"+ Log a visit"</strong> button above.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visits.map((visit) => (
              <div
                key={visit.id}
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 20,
                }}
              >
                {/* Date block */}
                <div
                  style={{
                    flexShrink: 0,
                    background: 'var(--paper-2)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    textAlign: 'center',
                    minWidth: 64,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: 22,
                      fontWeight: 600,
                      color: 'var(--forest)',
                      lineHeight: 1,
                    }}
                  >
                    {visit.visitDate.getDate()}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-mute)',
                      marginTop: 3,
                    }}
                  >
                    {visit.visitDate.toLocaleDateString('en-IN', { month: 'short' })}
                    {' '}
                    {visit.visitDate.getFullYear()}
                  </div>
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      marginBottom: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {visit.duration && (
                      <div
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-mute)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span>⏱</span> {visit.duration}
                      </div>
                    )}
                    {visit.companions && (
                      <div
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-mute)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span>👥</span> {visit.companions}
                      </div>
                    )}
                  </div>
                  {visit.note && (
                    <p
                      style={{
                        fontFamily: 'var(--serif)',
                        fontStyle: 'italic',
                        fontSize: 15,
                        color: 'var(--ink-soft)',
                        lineHeight: 1.55,
                      }}
                    >
                      {visit.note}
                    </p>
                  )}
                </div>

                {/* Action */}
                <Link
                  href="/dashboard/notes"
                  className="btn btn-ghost btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  View notes
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div
        style={{
          background: 'var(--paper-2)',
          borderRadius: 16,
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 4,
            }}
          >
            Ready to visit?
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-soft)' }}>
            WhatsApp us to confirm your slot. Open every Saturday, 8 am – 5 pm.
          </div>
        </div>
        <a
          href={`https://wa.me/${FARM_WHATSAPP}?text=${planMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          Plan a visit →
        </a>
      </div>
    </div>
  )
}
