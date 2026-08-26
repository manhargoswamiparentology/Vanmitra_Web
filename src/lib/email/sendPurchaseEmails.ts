import { getResendClient, FROM_EMAIL } from './resend'
import { purchaserEmail, giftEmail } from './templates'
import { generateCertificatePdf } from '@/lib/pdf/certificate'
import { generateInvoicePdf } from '@/lib/pdf/invoice'
import { getDedicationPdfContext } from '@/lib/pdf/dedicationData'

// Fired once a Dedication is created (i.e. a tree purchase is confirmed).
// Never throws — a broken inbox shouldn't roll back a real tree purchase,
// so every failure here is caught and logged by the caller's try/catch too.
export async function sendPurchaseEmails(dedicationId: string, baseUrl: string): Promise<void> {
  const ctx = await getDedicationPdfContext(dedicationId, baseUrl)
  if (!ctx) return

  const {
    dedication, species, speciesName, occasionTitle, shortId, invoiceNo, invoiceDate,
    dateLabel, location, dedicationUrl, shareUrl, recipientEmail, purchaserEmailAddr,
    isGift, dedicatedBy, occasion,
  } = ctx

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
