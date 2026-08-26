import { prisma } from '@/lib/db'
import { SPECIES, OCCASIONS } from '@/data/constants'
import { getResendClient, FROM_EMAIL } from './resend'
import { purchaserEmail, giftEmail } from './templates'
import { generateCertificatePdf } from '@/lib/pdf/certificate'
import { generateInvoicePdf } from '@/lib/pdf/invoice'

// Fired once a Dedication is created (i.e. a tree purchase is confirmed).
// Never throws — a broken inbox shouldn't roll back a real tree purchase,
// so every failure here is caught and logged by the caller's try/catch too.
export async function sendPurchaseEmails(dedicationId: string, baseUrl: string): Promise<void> {
  const dedication = await prisma.dedication.findUnique({
    where: { id: dedicationId },
    select: {
      id: true,
      createdAt: true,
      recipientName: true,
      message: true,
      occasionId: true,
      preferredDate: true,
      corporateName: true,
      employeeEmail: true,
      shareToken: true,
      user: { select: { name: true, email: true } },
      tree: {
        select: {
          uniqueId: true,
          speciesId: true,
          plotBlock: true,
          plotRow: true,
          plotPosition: true,
          locationAddress: true,
          price: true,
        },
      },
    },
  })

  if (!dedication) return

  const species = SPECIES.find(s => s.id === dedication.tree.speciesId)
  const occasion = OCCASIONS.find(o => o.id === dedication.occasionId)
  const speciesName = species?.name ?? 'native'
  const occasionTitle = occasion?.title ?? 'A living tribute'

  const shortId = dedication.id.slice(-8).toUpperCase()
  const invoiceNo = `INV-${shortId}`
  const invoiceDate = dedication.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const dateLabel = (dedication.preferredDate ?? dedication.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const location = dedication.tree.locationAddress
    || (dedication.tree.plotBlock
        ? `Block ${dedication.tree.plotBlock}${dedication.tree.plotRow ? `, Row ${dedication.tree.plotRow}` : ''}${dedication.tree.plotPosition ? `, Position ${dedication.tree.plotPosition}` : ''} — Vasna Village, Kheda, Gujarat`
        : 'Vasna Village, Kheda, Gujarat')

  const dedicationUrl = `${baseUrl}/dedications/${dedication.id}`
  const shareUrl = dedication.shareToken ? `${baseUrl}/certificate/${dedication.shareToken}` : null

  const recipientEmail = dedication.employeeEmail?.trim()
  const purchaserEmailAddr = dedication.user.email.trim()
  const isGift = !!recipientEmail && recipientEmail.toLowerCase() !== purchaserEmailAddr.toLowerCase()
  const dedicatedBy = dedication.corporateName || dedication.user.name

  const resend = getResendClient()

  // Certificate PDF is needed whenever we're mailing a certificate copy —
  // to the recipient always (if gifted), and to the purchaser as a courtesy copy.
  let certificatePdf: Uint8Array | null = null
  if (isGift || shareUrl) {
    certificatePdf = await generateCertificatePdf({
      certificateNo: shortId,
      speciesName,
      speciesLatin: species?.latin ?? 'Species native to Gujarat',
      occasionTagline: occasion?.tagline ?? 'A living tribute',
      recipientName: dedication.recipientName,
      dedicatedBy,
      message: dedication.message,
      treeUniqueId: dedication.tree.uniqueId,
      location,
      dateLabel,
      shareUrl,
    })
  }

  const invoicePdf = await generateInvoicePdf({
    invoiceNo,
    invoiceDate,
    billedToName: dedication.user.name,
    billedToEmail: dedication.user.email,
    corporateName: dedication.corporateName,
    orderId: shortId,
    treeUniqueId: dedication.tree.uniqueId,
    occasionTitle,
    itemDescription: `${speciesName} tree dedication`,
    itemSubline: `Dedicated to ${dedication.recipientName} · ${location}`,
    amount: dedication.tree.price ?? 500,
    status: 'CONFIRMED',
  })

  const purchaserAttachments: { filename: string; content: Buffer }[] = [
    { filename: `${invoiceNo}.pdf`, content: Buffer.from(invoicePdf) },
  ]
  if (isGift && certificatePdf) {
    purchaserAttachments.push({ filename: `Certificate-${shortId}.pdf`, content: Buffer.from(certificatePdf) })
  }

  const { subject: purchaserSubject, html: purchaserHtml } = purchaserEmail({
    purchaserName: dedication.user.name,
    isGift,
    recipientName: dedication.recipientName,
    speciesName,
    occasionTitle,
    treeUniqueId: dedication.tree.uniqueId,
    location,
    dedicationUrl,
    certificateUrl: shareUrl,
    invoiceNo,
    amount: dedication.tree.price ?? 500,
  })

  const sends: Promise<unknown>[] = [
    resend.emails.send({
      from: FROM_EMAIL,
      to: purchaserEmailAddr,
      subject: purchaserSubject,
      html: purchaserHtml,
      attachments: purchaserAttachments,
    }).catch(err => console.error('Resend: failed to send purchaser email', err)),
  ]

  if (isGift && recipientEmail && certificatePdf && shareUrl) {
    const { subject: giftSubject, html: giftHtml } = giftEmail({
      gifterName: dedicatedBy,
      recipientName: dedication.recipientName,
      speciesName,
      speciesSymbolism: species?.symbolism ?? 'life and growth',
      occasionTitle,
      message: dedication.message,
      certificateUrl: shareUrl,
    })

    sends.push(
      resend.emails.send({
        from: FROM_EMAIL,
        to: recipientEmail,
        subject: giftSubject,
        html: giftHtml,
        attachments: [{ filename: `Certificate-${shortId}.pdf`, content: Buffer.from(certificatePdf) }],
      }).catch(err => console.error('Resend: failed to send gift email', err))
    )
  }

  await Promise.all(sends)
}
