import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { SPECIES, OCCASIONS } from '@/data/constants'
import CopyButton from '@/components/CopyButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DedicationPage({ params }: Props) {
  const { id } = await params

  let dedication: {
    id: string
    createdAt: Date
    recipientName: string
    recipientFrom: string | null
    message: string | null
    occasionId: string
    preferredDate: Date | null
    status: string
    corporateName: string | null
    shareToken: string | null
    employeeEmail: string | null
    user: { name: string; email: string }
    tree: {
      speciesId: string
      plotBlock: string | null
      uniqueId: string
      locationAddress: string | null
      price: number
    }
  } | null = null

  try {
    dedication = await prisma.dedication.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        recipientName: true,
        recipientFrom: true,
        message: true,
        occasionId: true,
        preferredDate: true,
        status: true,
        corporateName: true,
        shareToken: true,
        employeeEmail: true,
        user: { select: { name: true, email: true } },
        tree: {
          select: {
            speciesId: true,
            plotBlock: true,
            uniqueId: true,
            locationAddress: true,
            price: true,
          },
        },
      },
    })
  } catch {
    // DB not available in some build modes — graceful fallback
  }

  if (!dedication) notFound()

  const shortId = dedication.id.slice(-8).toUpperCase()
  const invoiceNo = `INV-${shortId}`
  const invoiceDate = new Date(dedication.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const species = SPECIES.find(s => s.id === dedication!.tree.speciesId)
  const occasion = OCCASIONS.find(o => o.id === dedication!.occasionId)
  const plotDisplay = dedication.tree.locationAddress
    || (dedication.tree.plotBlock ? `Block ${dedication.tree.plotBlock}` : 'the Kheda farm')
  const treePrice = dedication.tree.price ?? 500
  const plantedDate = dedication.preferredDate
    ? new Date(dedication.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Being allocated'

  // Build share URL from the actual incoming host so it works on any domain / preview URL
  const headersList = await headers()
  const host = headersList.get('host') || 'vanamitra-seven.vercel.app'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const shareUrl = dedication.shareToken
    ? `${baseUrl}/certificate/${dedication.shareToken}`
    : null

  return (
    <div style={{ padding: '60px 0 100px', background: 'var(--paper)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

        {/* Check circle */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'color-mix(in oklch, var(--moss) 20%, var(--paper))',
          border: '2px solid var(--moss)',
          color: 'var(--moss)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 32,
          margin: '0 auto 24px',
        }}>
          ✓
        </div>

        <p className="mono" style={{ color: 'var(--ink-mute)', marginBottom: 12 }}>
          ORDER #{shortId}
        </p>

        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 20, lineHeight: 1.1 }}>
          It&apos;s done. The tree is coming.
        </h1>

        <p style={{
          fontFamily: 'var(--serif)',
          fontSize: 18,
          color: 'var(--ink-soft)',
          lineHeight: 1.65,
          marginBottom: dedication.corporateName ? 16 : 48,
        }}>
          Your {species?.name || 'sapling'} has been dedicated to {dedication.recipientName}.
          Tree {dedication.tree.uniqueId} is now allocated at {plotDisplay}.
        </p>

        {/* Corporate attribution */}
        {dedication.corporateName && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            background: 'color-mix(in oklch, var(--forest) 10%, var(--paper))',
            border: '1px solid color-mix(in oklch, var(--forest) 25%, transparent)',
            marginBottom: 48,
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--forest)',
            letterSpacing: '0.05em',
          }}>
            🏢 Planted by {dedication.corporateName}
          </div>
        )}

        {/* Certificate preview */}
        <div style={{
          aspectRatio: '1 / 1.41',
          maxWidth: 540,
          margin: '0 auto 48px',
          background: 'oklch(0.97 0.018 85)',
          border: '1px solid color-mix(in oklch, var(--terra) 40%, var(--line))',
          boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--terra) 30%, transparent),
                      inset 0 0 0 8px oklch(0.97 0.018 85),
                      inset 0 0 0 10px color-mix(in oklch, var(--terra) 20%, transparent)`,
          borderRadius: 4,
          padding: '40px 44px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          textAlign: 'left',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: 'var(--forest)', letterSpacing: '-0.01em' }}>
              Vanam<span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>itra</span>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
              Certificate №<br />
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{shortId}</span>
            </div>
          </div>

          {/* Center content */}
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
            {dedication.corporateName && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--forest)', letterSpacing: '0.08em', marginTop: 4 }}>
                Planted by {dedication.corporateName}
              </div>
            )}

            {/* Details grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px dotted color-mix(in oklch, var(--terra) 25%, transparent)',
            }}>
              {[
                ['Occasion', occasion?.title ?? '—'],
                ['Planted', plantedDate],
                ['Plot', dedication.tree.plotBlock || 'Vasna Farm, Kheda'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 3 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {dedication.message && (
              <div style={{
                marginTop: 16,
                padding: '10px 14px',
                background: 'color-mix(in oklch, var(--terra) 6%, transparent)',
                borderLeft: '2px solid color-mix(in oklch, var(--terra) 45%, transparent)',
                borderRadius: '0 8px 8px 0',
                textAlign: 'left',
              }}>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
                  &ldquo;{dedication.message}&rdquo;
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
              Date: {dedication.preferredDate
                ? new Date(dedication.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Being allocated'}
            </div>
            <div className="stamp" style={{ width: 80, height: 80, fontSize: 8, padding: 10, lineHeight: 1.5 }}>
              Living<br />tribute<br />· est 2026 ·
            </div>
          </div>
        </div>

        {/* Share certificate link */}
        {shareUrl && (
          <div style={{
            background: 'var(--paper-2)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '18px 20px',
            marginBottom: 24,
            textAlign: 'left',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 10 }}>
              Share this certificate
            </div>

            {/* URL display + copy */}
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: '8px 10px 8px 14px',
              marginBottom: 12,
            }}>
              <span style={{
                flex: 1,
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--forest)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}>
                {shareUrl}
              </span>
              <CopyButton url={shareUrl} label="Copy link" />
            </div>

            {/* Secondary share options */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`A ${species?.name || 'tree'} has been planted in the name of ${dedication.recipientName}. View the certificate: ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-terra btn-sm"
              >
                Share on WhatsApp
              </a>
              <a
                href={`mailto:${dedication.employeeEmail || ''}?subject=${encodeURIComponent(`A tree has been planted for you — ${dedication.recipientName}`)}&body=${encodeURIComponent(`Hello,\n\nA ${species?.name || 'tree'} has been dedicated in your name on the Vanamitra farm in Kheda, Gujarat.\n\nView your certificate here:\n${shareUrl}\n\nWith love,\n${dedication.recipientFrom || 'Vanamitra'}`)}`}
                className="btn btn-ghost btn-sm"
              >
                Send via email
              </a>
            </div>

            {dedication.employeeEmail && (
              <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', marginTop: 10, letterSpacing: '0.04em' }}>
                Recipient: {dedication.employeeEmail}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <a href={`/api/dedications/${dedication.id}/certificate`} className="btn btn-ghost btn-sm">
            Download certificate
          </a>
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            View my forest →
          </Link>
        </div>

        {/* ── Invoice / Receipt ── */}
        <div style={{ marginBottom: 48, textAlign: 'left' }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p className="mono-sm" style={{ color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>INVOICE / RECEIPT</p>
            <a href={`/api/dedications/${dedication.id}/invoice`} className="btn btn-ghost btn-sm">
              Download invoice
            </a>
          </div>

          {/* Invoice document — same parchment treatment as certificate */}
          <div id="invoice-print" style={{
            background: 'oklch(0.97 0.018 85)',
            border: '1px solid color-mix(in oklch, var(--terra) 40%, var(--line))',
            boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--terra) 30%, transparent),
                        inset 0 0 0 8px oklch(0.97 0.018 85),
                        inset 0 0 0 10px color-mix(in oklch, var(--terra) 20%, transparent)`,
            borderRadius: 4,
            padding: '36px 40px',
          }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 500, color: 'var(--forest)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                  Vanam<span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>itra</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', lineHeight: 1.8 }}>
                  Kheda, Gujarat, India<br />
                  vanamitra-seven.vercel.app
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: 6 }}>
                  Tax Invoice
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                  {invoiceNo}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 4 }}>
                  Date: {invoiceDate}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'color-mix(in oklch, var(--terra) 25%, transparent)', marginBottom: 24 }} />

            {/* Bill To / Order Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>
                  Billed To
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>
                  {dedication.user.name}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.02em' }}>
                  {dedication.user.email}
                </div>
                {dedication.corporateName && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--forest)', letterSpacing: '0.06em', marginTop: 4 }}>
                    {dedication.corporateName}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>
                  Order Details
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.9 }}>
                  Order ID: <span style={{ color: 'var(--ink)' }}>{shortId}</span><br />
                  Tree ID: <span style={{ color: 'var(--ink)' }}>{dedication.tree.uniqueId}</span><br />
                  Occasion: <span style={{ color: 'var(--ink)' }}>{occasion?.title ?? dedication.occasionId}</span>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div style={{
              border: '1px solid color-mix(in oklch, var(--terra) 25%, transparent)',
              borderRadius: 6,
              overflow: 'hidden',
              marginBottom: 0,
            }}>
              {/* Table head */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px',
                gap: 12,
                padding: '10px 16px',
                background: 'color-mix(in oklch, var(--terra) 8%, oklch(0.97 0.018 85))',
                borderBottom: '1px solid color-mix(in oklch, var(--terra) 20%, transparent)',
              }}>
                {['Description', 'Qty', 'Amount'].map(h => (
                  <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', textAlign: h === 'Amount' ? 'right' : 'left' }}>
                    {h}
                  </div>
                ))}
              </div>

              {/* Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px',
                gap: 12,
                padding: '14px 16px',
                alignItems: 'start',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>
                    {species?.name ?? 'Native'} tree dedication
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-mute)' }}>
                    Dedicated to {dedication.recipientName} · {plotDisplay}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center', paddingTop: 2 }}>
                  1
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', textAlign: 'right', paddingTop: 2 }}>
                  ₹{treePrice.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Total row */}
              <div style={{
                borderTop: '1px dotted color-mix(in oklch, var(--terra) 30%, transparent)',
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px',
                gap: 12,
                padding: '12px 16px',
                background: 'color-mix(in oklch, var(--terra) 5%, oklch(0.97 0.018 85))',
                alignItems: 'center',
              }}>
                <div style={{ gridColumn: '1 / 3', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                  Total Paid
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 600, color: 'var(--forest)', textAlign: 'right', letterSpacing: '-0.01em' }}>
                  ₹{treePrice.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dotted color-mix(in oklch, var(--terra) 25%, transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.08em', color: 'var(--ink-mute)', lineHeight: 1.8 }}>
                Status: <span style={{ color: dedication.status === 'CONFIRMED' ? 'var(--forest)' : 'var(--terra)', fontWeight: 600 }}>{dedication.status}</span><br />
                This is a computer-generated receipt. No signature required.
              </div>
              <div className="stamp" style={{ width: 72, height: 72, fontSize: 7.5, padding: 9, lineHeight: 1.6 }}>
                Paid ·<br />Vanam<br />itra
              </div>
            </div>
          </div>
        </div>

        {/* Timeline strip */}
        <div style={{
          background: 'var(--paper-2)',
          borderRadius: 16,
          padding: '24px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          textAlign: 'left',
        }}>
          {[
            { when: 'Right now', what: 'Tree allocated', note: 'Your tree is confirmed and allocated. Certificate is live — share it immediately.' },
            { when: 'This month', what: 'First photo', note: 'Our farm team visits, photographs your tree, and posts the first update.' },
            { when: 'Every 1st', what: 'Monthly update', note: 'A fresh photo and note from the farm lands in your dashboard.' },
          ].map((t, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: 6 }}>
                {t.when}
              </div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                {t.what}
              </div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.55 }}>
                {t.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
