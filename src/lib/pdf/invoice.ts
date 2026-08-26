import { PDFDocument, StandardFonts } from 'pdf-lib'
import { COLORS } from './colors'
import { wrapText } from './wrap'

export interface InvoicePdfData {
  invoiceNo: string
  invoiceDate: string
  billedToName: string
  billedToEmail: string
  corporateName?: string | null
  orderId: string
  treeUniqueId: string
  occasionTitle: string
  itemDescription: string
  itemSubline: string
  amount: number
  status: string
}

function inr(n: number) {
  return `Rs. ${n.toLocaleString('en-IN')}`
}

const PAGE_WIDTH = 595.28 // A4 width — height is sized to content, so the receipt never looks half-blank
const MARGIN = 50

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()

  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic)
  const display = await doc.embedFont(StandardFonts.HelveticaBold)
  const mono = await doc.embedFont(StandardFonts.Helvetica)

  const left = MARGIN
  const right = PAGE_WIDTH - MARGIN
  const sublineLines = wrapText(data.itemSubline, serifItalic, 9.5, (right - left) * 0.55)

  // Same running-offset trick as the certificate: size the page to this
  // invoice's actual content instead of dropping it onto a mostly-blank A4 sheet.
  let cursor = MARGIN + 30 // header baseline
  cursor += 60 // header -> divider
  cursor += 30 // divider -> column labels
  cursor += 18 + 14 + 14 // billed-to / order-detail rows
  cursor += 30 // -> table top
  cursor += 22 // table head row
  cursor += 18 + (sublineLines.length * 14) + 4 // description + wrapped subline
  const rowBottomPad = 14
  cursor += rowBottomPad
  cursor += 26 // total row
  cursor += 44 // gap before footer note
  cursor += 26 // footer note lines
  cursor += 36 // bottom breathing room

  const pageHeight = Math.max(cursor, 380)
  const page = doc.addPage([PAGE_WIDTH, pageHeight])

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: pageHeight, color: COLORS.paper })
  page.drawRectangle({ x: MARGIN - 10, y: MARGIN - 10, width: PAGE_WIDTH - (MARGIN - 10) * 2, height: pageHeight - (MARGIN - 10) * 2, borderColor: COLORS.paperBorder, borderWidth: 1 })

  let y = pageHeight - MARGIN - 30

  page.drawText('Vanamitra', { x: left, y, size: 20, font: display, color: COLORS.forest })
  page.drawText('Kheda, Gujarat, India', { x: left, y: y - 18, size: 8.5, font: mono, color: COLORS.inkMute })
  page.drawText('vanamitra-seven.vercel.app', { x: left, y: y - 30, size: 8.5, font: mono, color: COLORS.inkMute })

  const rightLabel = 'TAX INVOICE'
  page.drawText(rightLabel, { x: right - mono.widthOfTextAtSize(rightLabel, 9), y, size: 9, font: mono, color: COLORS.terra })
  const invoiceNoW = display.widthOfTextAtSize(data.invoiceNo, 15)
  page.drawText(data.invoiceNo, { x: right - invoiceNoW, y: y - 18, size: 15, font: display, color: COLORS.ink })
  const dateLabel = `Date: ${data.invoiceDate}`
  page.drawText(dateLabel, { x: right - mono.widthOfTextAtSize(dateLabel, 9), y: y - 34, size: 9, font: mono, color: COLORS.inkMute })

  y -= 60
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 1, color: COLORS.terraSoft })
  y -= 30

  const colGap = 24
  const colWidth = (right - left - colGap) / 2

  page.drawText('BILLED TO', { x: left, y, size: 8, font: mono, color: COLORS.inkMute })
  page.drawText('ORDER DETAILS', { x: left + colWidth + colGap, y, size: 8, font: mono, color: COLORS.inkMute })
  y -= 18

  page.drawText(data.billedToName, { x: left, y, size: 12, font: display, color: COLORS.ink })
  page.drawText(`Order ID: ${data.orderId}`, { x: left + colWidth + colGap, y, size: 9.5, font: mono, color: COLORS.inkSoft })
  y -= 14

  page.drawText(data.billedToEmail, { x: left, y, size: 9.5, font: mono, color: COLORS.inkMute })
  page.drawText(`Tree ID: ${data.treeUniqueId}`, { x: left + colWidth + colGap, y, size: 9.5, font: mono, color: COLORS.inkSoft })
  y -= 14

  if (data.corporateName) {
    page.drawText(data.corporateName, { x: left, y, size: 9.5, font: mono, color: COLORS.forest })
  }
  page.drawText(`Occasion: ${data.occasionTitle}`, { x: left + colWidth + colGap, y, size: 9.5, font: mono, color: COLORS.inkSoft })
  y -= 30

  // Line-item table
  const tableTop = y
  const col1 = left
  const col2 = left + colWidth * 1.35
  const col3 = right - 90

  page.drawRectangle({ x: left, y: tableTop - 22, width: right - left, height: 22, color: COLORS.terraSoft, opacity: 0.35 })
  page.drawText('DESCRIPTION', { x: col1 + 8, y: tableTop - 15, size: 8, font: mono, color: COLORS.inkMute })
  page.drawText('QTY', { x: col2, y: tableTop - 15, size: 8, font: mono, color: COLORS.inkMute })
  page.drawText('AMOUNT', { x: col3, y: tableTop - 15, size: 8, font: mono, color: COLORS.inkMute })

  const rowTop = tableTop - 22
  page.drawText(data.itemDescription, { x: col1 + 8, y: rowTop - 18, size: 11.5, font: display, color: COLORS.ink })
  let sy = rowTop - 32
  for (const line of sublineLines) {
    page.drawText(line, { x: col1 + 8, y: sy, size: 9.5, font: serifItalic, color: COLORS.inkMute })
    sy -= 14
  }
  page.drawText('1', { x: col2, y: rowTop - 18, size: 10, font: mono, color: COLORS.inkSoft })
  const amtStr = inr(data.amount)
  page.drawText(amtStr, { x: col3, y: rowTop - 18, size: 11, font: display, color: COLORS.ink })

  const rowBottom = sy + 4 // just under the last subline
  const totalTop = rowBottom - rowBottomPad
  page.drawRectangle({ x: left, y: totalTop - 26, width: right - left, height: 26, color: COLORS.terraSoft, opacity: 0.2 })
  page.drawLine({ start: { x: left, y: totalTop }, end: { x: right, y: totalTop }, thickness: 0.75, color: COLORS.terraSoft, dashArray: [2, 2] })
  page.drawText('TOTAL PAID', { x: col1 + 8, y: totalTop - 17, size: 8.5, font: mono, color: COLORS.inkMute })
  const totalStr = inr(data.amount)
  const totalW = display.widthOfTextAtSize(totalStr, 14)
  page.drawText(totalStr, { x: right - 8 - totalW, y: totalTop - 18, size: 14, font: display, color: COLORS.forest })

  page.drawRectangle({ x: left, y: totalTop - 26, width: right - left, height: (tableTop - totalTop) + 26, borderColor: COLORS.terraSoft, borderWidth: 1 })

  const footerY = totalTop - 70
  page.drawText(`Status: ${data.status}`, { x: left, y: footerY, size: 8.5, font: mono, color: COLORS.forest })
  page.drawText('This is a computer-generated receipt. No signature required.', { x: left, y: footerY - 13, size: 8, font: mono, color: COLORS.inkMute })

  return doc.save()
}
