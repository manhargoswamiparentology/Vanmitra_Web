import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { SPECIES, OCCASIONS } from '@/data/constants'

interface Props {
  params: Promise<{ shareToken: string }>
}

export default async function PublicCertificatePage({ params }: Props) {
  const { shareToken } = await params

  let dedication: {
    id: string
    recipientName: string
    recipientFrom: string | null
    message: string | null
    occasionId: string
    preferredDate: Date | null
    corporateName: string | null
    employeeEmail: string | null
    user: { name: string }
    tree: {
      speciesId: string
      plotBlock: string | null
      uniqueId: string
      locationAddress: string | null
      updates: { id: string; message: string; createdAt: Date; photoUrl: string | null }[]
    }
  } | null = null

  try {
    dedication = await prisma.dedication.findUnique({
      where: { shareToken },
      select: {
        id: true,
        recipientName: true,
        recipientFrom: true,
        message: true,
        occasionId: true,
        preferredDate: true,
        corporateName: true,
        employeeEmail: true,
        user: { select: { name: true } },
        tree: {
          select: {
            speciesId: true,
            plotBlock: true,
            uniqueId: true,
            locationAddress: true,
            updates: {
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
        },
      },
    })
  } catch {
    // graceful fallback
  }

  if (!dedication) notFound()

  const shortId = dedication.id.slice(-8).toUpperCase()
  const species = SPECIES.find(s => s.id === dedication!.tree.speciesId)
  const occasion = OCCASIONS.find(o => o.id === dedication!.occasionId)
  const plotDisplay = dedication.tree.locationAddress
    || (dedication.tree.plotBlock ? `Block ${dedication.tree.plotBlock}` : 'Vasna Village, Kheda, Gujarat')
  const headersList = await headers()
  const host = headersList.get('host') || 'vanamitra-seven.vercel.app'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const siteUrl = `${proto}://${host}`
  const registerUrl = dedication.employeeEmail
    ? `${siteUrl}/auth/register?email=${encodeURIComponent(dedication.employeeEmail)}`
    : `${siteUrl}/auth/register`

  return (
    <div style={{ padding: '40px 0 100px', background: 'var(--paper)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>

        {/* Vanamitra header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500, color: 'var(--forest)' }}>
              Vanam<em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--moss)' }}>itra</em>
            </div>
          </Link>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginTop: 6 }}>
            Certificate of Tree Dedication
          </p>
        </div>

        {/* Certificate */}
        <div style={{
          aspectRatio: '1 / 1.41',
          maxWidth: 540,
          margin: '0 auto 40px',
          background: 'oklch(0.97 0.018 85)',
          border: '1px solid color-mix(in oklch, var(--terra) 40%, var(--line))',
          boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--terra) 30%, transparent),
                      inset 0 0 0 8px oklch(0.97 0.018 85),
                      inset 0 0 0 10px color-mix(in oklch, var(--terra) 20%, transparent),
                      0 4px 32px rgba(0,0,0,0.08)`,
          borderRadius: 4,
          padding: '40px 44px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          textAlign: 'left',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: 'var(--forest)', letterSpacing: '-0.01em' }}>
              Vanam<span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>itra</span>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
              Certificate №<br />
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{shortId}</span>
            </div>
          </div>

          {/* Center */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
            <p className="eyebrow" style={{ justifyContent: 'flex-start', fontSize: 10, color: 'var(--terra)' }}>
              {occasion?.tagline || 'A living tribute'}
            </p>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {species?.name || 'Native sapling'} tree
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-mute)' }}>
              {species?.latin || 'Species native to Gujarat'}
            </div>
            <div style={{ height: 1, background: 'color-mix(in oklch, var(--terra) 30%, transparent)', margin: '8px 0' }} />
            <p style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink-mute)', letterSpacing: '0.04em' }}>
              Has been planted in honour of
            </p>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.2 }}>
              {dedication.recipientName}
            </div>
            {dedication.recipientFrom && (
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)' }}>
                {dedication.recipientFrom}
              </div>
            )}
            {/* Who dedicated it */}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--forest)', letterSpacing: '0.08em', marginTop: 4 }}>
              Dedicated by {dedication.corporateName || dedication.user.name}
            </div>
            {dedication.message && (
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                background: 'color-mix(in oklch, var(--terra) 8%, oklch(0.97 0.018 85))',
                borderLeft: '2px solid color-mix(in oklch, var(--terra) 50%, transparent)',
                borderRadius: '0 6px 6px 0',
              }}>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
                  &ldquo;{dedication.message.length > 100 ? dedication.message.slice(0, 100) + '…' : dedication.message}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: '1px dotted color-mix(in oklch, var(--terra) 30%, transparent)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', lineHeight: 1.7 }}>
              Tree: {dedication.tree.uniqueId}<br />
              Location: {plotDisplay}<br />
              {dedication.preferredDate
                ? `Date: ${new Date(dedication.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'Kheda farm · Gujarat, India'}
            </div>
            <div className="stamp" style={{ width: 80, height: 80, fontSize: 8, padding: 10, lineHeight: 1.5 }}>
              Living<br />tribute<br />· est 2026 ·
            </div>
          </div>
        </div>

        {/* Dedication attribution strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '14px 20px',
          background: 'var(--paper-2)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          marginBottom: 28,
          flexWrap: 'wrap',
          textAlign: 'center',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--forest)', color: 'var(--paper)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14,
            flexShrink: 0,
          }}>
            {dedication.user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-soft)' }}>
              This tree was dedicated by{' '}
            </span>
            <span style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
              {dedication.corporateName || dedication.user.name}
            </span>
            {dedication.corporateName && (
              <span style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink-mute)' }}>
                {' '}· {dedication.user.name}
              </span>
            )}
          </div>
        </div>

        {/* Tree updates preview */}
        {dedication.tree.updates.length > 0 && (
          <div style={{
            background: 'var(--paper-2)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '20px 24px',
            marginBottom: 32,
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>
              Latest Updates from the Farm
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {dedication.tree.updates.map((u, i) => (
                <div key={u.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink)', flex: 1, lineHeight: 1.5 }}>
                      {u.message}
                    </p>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {u.photoUrl && (
                    <img
                      src={u.photoUrl}
                      alt="Tree update"
                      style={{ width: '100%', borderRadius: 8, aspectRatio: '16/9', objectFit: 'cover', marginTop: 8 }}
                    />
                  )}
                  {i < dedication!.tree.updates.length - 1 && <hr className="dotted-rule" style={{ margin: '10px 0 0' }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA — create account to see full progress */}
        <div style={{
          background: 'var(--forest)',
          borderRadius: 16,
          padding: '28px 28px 24px',
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--paper)',
            marginBottom: 10,
          }}>
            Watch {dedication.recipientName}&apos;s tree grow
          </div>
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 14,
            color: 'color-mix(in srgb, var(--paper) 75%, transparent)',
            lineHeight: 1.6,
            marginBottom: 20,
          }}>
            Create a free account to see monthly photos, GPS location,
            and the full story of this tree — updated every month by our farm team.
          </p>
          {dedication.employeeEmail && (
            <p style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'color-mix(in srgb, var(--paper) 55%, transparent)',
              letterSpacing: '0.05em',
              marginBottom: 16,
            }}>
              Use {dedication.employeeEmail} to link your account to this tree.
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={registerUrl} className="btn btn-terra">
              Create account →
            </Link>
            <Link href="/auth/login" className="btn btn-ghost" style={{ color: 'var(--paper)', borderColor: 'rgba(255,255,255,0.35)' }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* About Vanamitra footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.65 }}>
            Vanamitra is a tree dedication platform based in Kheda, Gujarat. Every tree is real,
            every location is GPS-tagged, and every monthly update comes straight from the farm.
          </p>
          <Link href="/" style={{ display: 'inline-block', marginTop: 16, fontFamily: 'var(--display)', fontSize: 14, color: 'var(--forest)', textDecoration: 'none', fontWeight: 500 }}>
            Plant your own tree →
          </Link>
        </div>

      </div>
    </div>
  )
}
