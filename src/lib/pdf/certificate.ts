import { PDFDocument, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import { COLORS } from './colors'
import { wrapText } from './wrap'

export interface CertificatePdfData {
  certificateNo: string
  speciesName: string
  speciesLatin: string
  occasionTagline: string
  recipientName: string
  dedicatedBy: string
  message?: string | null
  treeUniqueId: string
  location: string
  dateLabel: string
  shareUrl: string | null
}

const PAGE_WIDTH = 595.28 // A4 width — height is sized to content, so the card never looks half-blank
const MARGIN = 46

export async function generateCertificatePdf(data: CertificatePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()

  const serif = await doc.embedFont(StandardFonts.TimesRoman)
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic)
  const display = await doc.embedFont(StandardFonts.HelveticaBold)
  const mono = await doc.embedFont(StandardFonts.Helvetica)

  const innerLeft = MARGIN + 28
  const innerRight = PAGE_WIDTH - MARGIN - 28
  const innerWidth = innerRight - innerLeft

  const messageLines = data.message?.trim()
    ? wrapText(`"${data.message.trim()}"`, serifItalic, 11, innerWidth - 24)
    : []
  const messageBoxHeight = messageLines.length ? messageLines.length * 15 + 16 : 0

  // Walk the layout top-to-bottom as a running offset from the page top, so
  // the page height can be sized to whatever this certificate actually needs
  // (a one-line message vs a 500-char one) instead of a fixed, often-blank A4 sheet.
  let cursor = MARGIN + 56 // header baseline
  cursor += 46 // header -> eyebrow
  cursor += 30 // eyebrow -> heading
  cursor += 22 // heading -> latin name
  cursor += 16 // latin name -> divider
  cursor += 26 // divider -> "has been planted in honour of"
  cursor += 30 // -> recipient name
  cursor += 26 // -> "dedicated by"
  cursor += 24 // -> message box (or footer divider)
  if (messageBoxHeight) cursor += messageBoxHeight
  const footerGap = 36
  cursor += footerGap
  const footerBlockHeight = 90 // 3 label lines + QR code + caption
  cursor += footerBlockHeight
  cursor += 30 // bottom breathing room inside the frame

  const pageHeight = Math.max(cursor, 480)
  const page = doc.addPage([PAGE_WIDTH, pageHeight])

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: pageHeight, color: COLORS.paper })
  page.drawRectangle({
    x: MARGIN, y: MARGIN, width: PAGE_WIDTH - MARGIN * 2, height: pageHeight - MARGIN * 2,
    borderColor: COLORS.paperBorder, borderWidth: 1.4,
  })
  page.drawRectangle({
    x: MARGIN + 10, y: MARGIN + 10, width: PAGE_WIDTH - (MARGIN + 10) * 2, height: pageHeight - (MARGIN + 10) * 2,
    borderColor: COLORS.terraSoft, borderWidth: 1,
  })

  let y = pageHeight - MARGIN - 56

  // Header row
  page.drawText('Vanamitra', { x: innerLeft, y, size: 20, font: display, color: COLORS.forest })
  const certLabel = 'CERTIFICATE NO.'
  const certLabelW = mono.widthOfTextAtSize(certLabel, 8)
  page.drawText(certLabel, { x: innerRight - certLabelW, y: y + 6, size: 8, font: mono, color: COLORS.inkMute })
  const certNoW = display.widthOfTextAtSize(data.certificateNo, 11)
  page.drawText(data.certificateNo, { x: innerRight - certNoW, y: y - 8, size: 11, font: display, color: COLORS.ink })

  y -= 46
  page.drawText(data.occasionTagline.toUpperCase(), { x: innerLeft, y, size: 9, font: mono, color: COLORS.terra })

  y -= 30
  page.drawText(`${data.speciesName} tree`, { x: innerLeft, y, size: 26, font: display, color: COLORS.ink })
  y -= 22
  page.drawText(data.speciesLatin, { x: innerLeft, y, size: 12, font: serifItalic, color: COLORS.inkMute })
  y -= 16
  page.drawLine({ start: { x: innerLeft, y }, end: { x: innerRight, y }, thickness: 1, color: COLORS.terraSoft })

  y -= 26
  page.drawText('Has been planted in honour of', { x: innerLeft, y, size: 12, font: serif, color: COLORS.inkMute })
  y -= 30
  page.drawText(data.recipientName, { x: innerLeft, y, size: 28, font: serif, color: COLORS.ink })
  y -= 26
  page.drawText(`Dedicated by ${data.dedicatedBy}`, { x: innerLeft, y, size: 11, font: display, color: COLORS.forest })
  y -= 24

  if (messageLines.length) {
    const boxTop = y + 12
    page.drawRectangle({ x: innerLeft, y: boxTop - messageBoxHeight, width: innerWidth, height: messageBoxHeight, color: COLORS.terraSoft, opacity: 0.25 })
    page.drawLine({ start: { x: innerLeft, y: boxTop }, end: { x: innerLeft, y: boxTop - messageBoxHeight }, thickness: 2, color: COLORS.terra })
    let ly = y
    for (const line of messageLines) {
      page.drawText(line, { x: innerLeft + 12, y: ly, size: 11, font: serifItalic, color: COLORS.inkSoft })
      ly -= 15
    }
    y -= messageBoxHeight
  }

  // Footer block, directly below whatever content ended above (message or not)
  const footerTop = y - footerGap
  page.drawLine({ start: { x: innerLeft, y: footerTop }, end: { x: innerRight, y: footerTop }, thickness: 0.75, color: COLORS.terraSoft, dashArray: [2, 2] })

  const footerY = footerTop - 22
  const footerLines = [
    `Tree: ${data.treeUniqueId}`,
    `Location: ${data.location}`,
    `Date: ${data.dateLabel}`,
  ]
  let fy = footerY
  for (const line of footerLines) {
    page.drawText(line, { x: innerLeft, y: fy, size: 8.5, font: mono, color: COLORS.inkMute })
    fy -= 13
  }

  if (data.shareUrl) {
    try {
      const qrPng = await QRCode.toBuffer(data.shareUrl, { type: 'png', margin: 1, width: 200, color: { dark: '#22503A', light: '#00000000' } })
      const qrImage = await doc.embedPng(qrPng)
      const qrSize = 64
      page.drawImage(qrImage, { x: innerRight - qrSize, y: footerY - 6, width: qrSize, height: qrSize })
      page.drawText('Scan to view live', { x: innerRight - qrSize, y: footerY - 18, size: 6.5, font: mono, color: COLORS.inkMute })
    } catch {
      // QR is a nice-to-have; skip silently if generation fails
    }
  }

  return doc.save()
}
