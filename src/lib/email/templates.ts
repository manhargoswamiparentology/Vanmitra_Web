// Inline-styled HTML email bodies. Email clients don't support CSS variables or
// modern layout (flex/grid in older Outlook), so everything here is literal
// hex colors and simple block divs — the same palette as the on-site cards,
// just hand-translated for the inbox.

const COLOR = {
  paper: '#FBF7EE',
  forest: '#22503A',
  forestDeep: '#173B29',
  terra: '#C0603E',
  ink: '#2B2620',
  inkSoft: '#4A4238',
  inkMute: '#8C8375',
  border: '#E7DDCB',
}

function wrapper(bodyHtml: string, preheader: string) {
  return `<!doctype html>
<html>
<head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:${COLOR.paper};font-family:Georgia,'Times New Roman',serif;color:${COLOR.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <div style="max-width:600px;margin:0 auto;padding:32px 20px 56px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-family:Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:${COLOR.forest};">Vanam<i style="font-family:Georgia,serif;color:${COLOR.forestDeep};">itra</i></span>
    </div>
    ${bodyHtml}
    <div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid ${COLOR.border};">
      <p style="font-size:12px;color:${COLOR.inkMute};line-height:1.6;margin:0;">
        Vanamitra · Kheda, Gujarat, India<br/>
        Every tree is real, GPS-tagged, and photographed every month from the farm.
      </p>
    </div>
  </div>
</body>
</html>`
}

function button(href: string, label: string, color = COLOR.forest) {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:8px;">${label}</a>`
}

export interface PurchaserEmailData {
  purchaserName: string
  isGift: boolean
  recipientName: string
  speciesName: string
  occasionTitle: string
  treeUniqueId: string
  location: string
  dedicationUrl: string
  certificateUrl: string | null
  invoiceNo: string
  amount: number
}

export function purchaserEmail(data: PurchaserEmailData): { subject: string; html: string } {
  const subject = data.isGift
    ? `Your gift is planted 🌱 — a ${data.speciesName} for ${data.recipientName}`
    : `Thank you for planting with Vanamitra 🌱`

  const intro = data.isGift
    ? `Your <strong>${data.speciesName}</strong> has been planted in honour of <strong>${data.recipientName}</strong> at ${data.location}. We've sent ${data.recipientName.split(' ')[0]} a note of their own — you'll find a copy of their certificate attached here too.`
    : `Your <strong>${data.speciesName}</strong> is now planted at ${data.location}. Tree <strong>${data.treeUniqueId}</strong> carries your dedication, and it's yours to watch grow.`

  const attachmentNote = data.isGift
    ? `Attached to this email: your <strong>invoice</strong> and a copy of the <strong>certificate</strong> we sent to ${data.recipientName}.`
    : `Attached to this email: your <strong>invoice</strong> (${data.invoiceNo}).`

  const body = `
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${COLOR.terra};text-align:center;margin:0 0 12px;">
      ${data.occasionTitle}
    </p>
    <h1 style="font-family:Helvetica,Arial,sans-serif;font-size:26px;font-weight:700;color:${COLOR.ink};text-align:center;line-height:1.25;margin:0 0 20px;">
      Thank you for planting with us, ${data.purchaserName.split(' ')[0]}.
    </h1>
    <p style="font-size:16px;line-height:1.7;color:${COLOR.inkSoft};text-align:center;margin:0 0 28px;">
      ${intro}
    </p>
    <div style="text-align:center;margin-bottom:28px;">
      ${button(data.dedicationUrl, 'View your dedication →')}
    </div>
    <div style="background:#ffffff;border:1px solid ${COLOR.border};border-radius:12px;padding:18px 20px;margin-bottom:8px;">
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${COLOR.inkSoft};margin:0;">
        📎 ${attachmentNote}
      </p>
    </div>
  `
  return { subject, html: wrapper(body, subject) }
}

export interface GiftEmailData {
  gifterName: string
  recipientName: string
  speciesName: string
  speciesSymbolism: string
  occasionTitle: string
  message?: string | null
  certificateUrl: string
}

export function giftEmail(data: GiftEmailData): { subject: string; html: string } {
  const firstName = data.recipientName.split(' ')[0]
  const gifterFirst = data.gifterName.split(' ')[0]
  const subject = `${gifterFirst} planted a tree for you 🌳 — Vanamitra`

  const messageBlock = data.message && data.message.trim()
    ? `
    <div style="border-left:3px solid ${COLOR.terra};background:#FFF9F2;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 28px;">
      <p style="font-style:italic;font-size:15px;line-height:1.6;color:${COLOR.inkSoft};margin:0;">
        &ldquo;${data.message.trim()}&rdquo;
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.05em;color:${COLOR.inkMute};margin:10px 0 0;">— ${data.gifterName}</p>
    </div>`
    : ''

  const body = `
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${COLOR.terra};text-align:center;margin:0 0 12px;">
      ${data.occasionTitle}
    </p>
    <h1 style="font-family:Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:${COLOR.ink};text-align:center;line-height:1.25;margin:0 0 20px;">
      ${data.gifterName} planted a tree for you, ${firstName}.
    </h1>
    <p style="font-size:17px;line-height:1.75;color:${COLOR.inkSoft};text-align:center;margin:0 0 24px;">
      Somewhere on our farm in Kheda, Gujarat, a young <strong>${data.speciesName}</strong> now carries your name.
      It symbolises ${data.speciesSymbolism.toLowerCase()} — and it will be there for decades, growing a
      little more with every monsoon, long after today.
    </p>
    ${messageBlock}
    <div style="text-align:center;margin-bottom:28px;">
      ${button(data.certificateUrl, 'View your certificate →', COLOR.terra)}
    </div>
    <div style="background:#ffffff;border:1px solid ${COLOR.border};border-radius:12px;padding:18px 20px;margin-bottom:8px;">
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${COLOR.inkSoft};margin:0;">
        📎 Your certificate is attached to this email — and it's live on the link above, with monthly
        photos from the farm as your tree grows.
      </p>
    </div>
  `
  return { subject, html: wrapper(body, subject) }
}
