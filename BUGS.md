# Bugs & fixes log

Running log of bugs found and fixed in this repo, written so another session (or
another person) picking up the code has the context without re-discovering it.
Newest entries at the top. Each entry: symptom → root cause → fix → files.

---

## 3. Certificate list had no detail screen; thumbnails looked like placeholders

**Status:** Fixed (this PR)
**Reported:** Dashboard certificates page (`/dashboard/certificates`)

**Symptom:**
Clicking a certificate thumbnail just re-rendered the full certificate inline,
further down the *same* grid page (via a `?cert=<id>` query param) — no
dedicated screen, no back button. Separately, the thumbnails themselves were a
plain bordered box with a 🌳 emoji and a name — didn't read as "a certificate."

**Fix:**
- Split the page: `/dashboard/certificates` is now a grid-only listing page.
  Clicking a card navigates to a real route, `/dashboard/certificates/[id]`,
  which shows just that one certificate with a "← Back to certificates" link.
- Extracted the certificate markup (the parts common to both list and detail
  rendering) into `src/app/dashboard/certificates/CertificateCard.tsx` so
  there's one implementation, not two copies drifting apart.
- Redesigned the grid thumbnail to actually look like a miniature certificate:
  Vanamitra wordmark, an ornamental divider, italic serif recipient name,
  species name, and a small rotated wax-seal-style stamp (reusing the site's
  existing `.stamp` CSS class). Hover uses the shared `.card` class instead of
  one-off inline styles.

**Files:**
- `src/app/dashboard/certificates/page.tsx` (grid only now)
- `src/app/dashboard/certificates/[id]/page.tsx` (new — detail screen)
- `src/app/dashboard/certificates/CertificateCard.tsx` (new — shared card UI)

---

## 2. "Download certificate" and "Download invoice" did nothing / showed a blank print preview

**Status:** Fixed — [PR #2](https://github.com/manhargoswamiparentology/Vanmitra_Web/pull/2) (merged)
**Reported:** Post-purchase confirmation page (`/dedications/[id]`) and the
dashboard certificates page.

**Symptom:**
- "Download certificate" button had **no click handler at all** — it was a
  static `<button>`, clicking it did nothing.
- "Download invoice" called `window.print()` combined with print-only CSS:
  ```css
  @media print {
    body > * { display: none !important; }
    #invoice-print { display: block !important; }
  }
  ```
  The print preview came out **completely blank**.

**Root cause (invoice):** `#invoice-print` is nested several levels deep
inside the page's own wrapper divs, which are themselves direct children of
`<body>`. `body > * { display: none }` hides those wrapper divs. A `display:
none` ancestor removes its entire subtree from rendering — it doesn't matter
that `#invoice-print` itself is set back to `display: block`, because its
*parent* is still hidden. Classic print-CSS footgun; the fix isn't "un-hide by
id", it needs `visibility` semantics or (better, what we did) not rely on
print at all.

**Fix:**
Replaced both buttons with real downloads instead of browser print/no-op:
- New route `src/app/api/dedications/[id]/certificate/route.ts` — streams a
  certificate PDF (`Content-Type: application/pdf`,
  `Content-Disposition: attachment`).
- New route `src/app/api/dedications/[id]/invoice/route.ts` — same, for the
  invoice.
- Both reuse the `pdf-lib` generators originally built for the purchase
  emails (see bug #1) via a shared data-loader,
  `src/lib/pdf/dedicationData.ts`, so the "how do we describe this
  dedication" logic exists in exactly one place.
- Deleted `src/app/dedications/[id]/InvoicePrintButton.tsx` (the print-hack
  component) — no longer needed, the button is now a plain `<a href=...>`.
- Also enriched the on-page certificate on `/dedications/[id]` with the
  Occasion / Planted / Plot / Certificate No. detail grid and the dedication
  message quote — it was missing both compared to the dashboard's own
  certificate view, which made it look sparse.
- Wired the dashboard's own "Download PDF" button to the same new
  certificate route (it had the identical missing-handler bug).

**Access model note:** these routes intentionally do **not** check
`session.userId` against the dedication — same trust model as the existing
`/dedications/[id]` and `/certificate/[shareToken]` pages, where knowing the
id/token is the access key. Don't add stricter auth here without also
revisiting those pages.

**Files:**
- `src/app/api/dedications/[id]/certificate/route.ts` (new)
- `src/app/api/dedications/[id]/invoice/route.ts` (new)
- `src/lib/pdf/dedicationData.ts` (new — shared dedication → PDF-context loader)
- `src/app/dedications/[id]/page.tsx`
- `src/app/dedications/[id]/InvoicePrintButton.tsx` (deleted)
- `src/app/dashboard/certificates/page.tsx`
- `src/lib/email/sendPurchaseEmails.ts` (refactored to use the shared loader)

---

## 1. No email was sent when someone purchased/dedicated a tree

**Status:** Fixed — [PR #1](https://github.com/manhargoswamiparentology/Vanmitra_Web/pull/1) (merged)
**Reported:** Feature gap — `/api/inventory/confirm` created the Dedication
but never notified anyone by email.

**What was built:**
- Resend integration (`src/lib/email/resend.ts`) — `RESEND_API_KEY` +
  `RESEND_FROM_EMAIL` env vars (`vanmittra@parentology.app`). Both are set in
  Vercel Production already.
- On every confirmed purchase, `sendPurchaseEmails()`
  (`src/lib/email/sendPurchaseEmails.ts`) is scheduled via Next's `after()`
  from `src/app/api/inventory/confirm/route.ts`, so email/PDF generation
  never blocks or slows the purchase response.
- The purchaser always gets a "Thank you for planting" email with an
  **invoice PDF** attached.
- If the dedication is a gift (recipient email ≠ purchaser's account email),
  the purchaser's email also gets a courtesy copy of the **certificate PDF**,
  and the recipient separately gets a distinct gift-styled email ("X planted
  a tree for you") with their own certificate PDF attached.
- PDFs are generated server-side with `pdf-lib` (`src/lib/pdf/certificate.ts`,
  `src/lib/pdf/invoice.ts`) — deliberately chosen over a headless-browser
  approach (e.g. Puppeteer) since this runs in a Vercel serverless function.
  Page height is computed from actual content length instead of a fixed A4
  size, so short certificates don't render with a large dead-space gap at the
  bottom (this bit the first draft — check the "running cursor" comment in
  `certificate.ts` if you're touching layout).

**Files:**
- `src/lib/email/resend.ts`, `templates.ts`, `sendPurchaseEmails.ts`
- `src/lib/pdf/certificate.ts`, `invoice.ts`, `colors.ts`, `wrap.ts`,
  `dedicationData.ts`
- `src/app/api/inventory/confirm/route.ts`

---

## Conventions for adding to this file

- New entry goes at the **top**, numbered one higher than the last.
- Include: status + PR link (once opened), symptom, root cause (if
  non-obvious), fix summary, and the list of files touched.
- If it's a UX/design change rather than a strict bug, say so — don't
  overclaim "bug" for everything.
