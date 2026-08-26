# Bugs & fixes log

Running log of bugs found and fixed in this repo, written so another session (or
another person) picking up the code has the context without re-discovering it.
Newest entries at the top. Each entry: symptom → root cause → fix → files.

---

## 5. Recipients with their own account couldn't see trees gifted to them

**Status:** Fixed (this PR)
**Reported:** User A dedicated a tree to User B's email. User B received the
email, could open the public `/certificate/[shareToken]` link, but when B
logged into their *own* Vanamitra account, the tree was nowhere to be found.

**Root cause:** `Dedication` has no field linking it to the recipient's own
`User` row — only `userId` (the *purchaser*) and `employeeEmail` (the
recipient's email, collected for every gift, not just corporate ones — see
`src/app/api/inventory/confirm/route.ts`). A matching mechanism already
existed (`src/app/dashboard/page.tsx`, the dashboard **home** tab queries
`employeeEmail: session.email` and renders a "Trees gifted to you 🎁"
section) but it was never applied to `/dashboard/trees` ("My Trees") or
`/dashboard/certificates` — the two places someone would actually go looking
for a gifted tree. Those two pages (and the certificate detail page beneath
them) filtered strictly by `userId: session.userId`, which a recipient never
matches.

Separately, `employeeEmail` was stored raw (no `.trim()`/`.toLowerCase()`)
even though `session.email` is always lowercase (enforced at
register/login) — a latent matching bug for any gift where the purchaser
typed the recipient's email with different case or stray whitespace.

**Fix:**
- `src/app/api/inventory/confirm/route.ts` — normalize `employeeEmail` to
  `trim().toLowerCase()` before storing.
- `src/app/dashboard/trees/page.tsx` and `src/app/dashboard/certificates/page.tsx`
  — the list query now does
  `OR: [{ userId: session.userId }, { employeeEmail: { equals: session.email, mode: 'insensitive' }, status: 'CONFIRMED' }]`,
  so gifted trees/certificates appear alongside owned ones. Gifted entries
  get a small "🎁 Gift from &lt;name&gt;" marker so they're not confused with
  the user's own purchases.
- `src/app/dashboard/certificates/[id]/page.tsx` — the detail page's access
  check now accepts the same `OR`, otherwise a gifted certificate would show
  up in the list but 404 when clicked (it was still gated on `userId` alone).
- `src/app/dashboard/page.tsx` — the existing home-tab query updated to the
  same case-insensitive match, for consistency.

**Note:** this only surfaces gifts for recipients who register with the
*same* email the gift was addressed to. There's still no backfill/claim step
at registration — the certificate page's "Use `<email>` to link your
account to this tree" copy is more a hint to the recipient than something
the app enforces; a recipient who signs up with a different email won't see
the gift.

**Files:**
- `src/app/api/inventory/confirm/route.ts`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/trees/page.tsx`
- `src/app/dashboard/certificates/page.tsx`
- `src/app/dashboard/certificates/[id]/page.tsx`

---

## 4. Admin "Add Tree" didn't jump to Draft; the tree's QR code led nowhere

**Status:** Fixed (this PR)
**Reported:** Admin inventory — `/admin/inventory/new`

**Symptom (1 — navigation):**
After submitting the single-tree "Add Tree" form, the admin stayed on the
same form with an inline "Tree added successfully" card. The new tree (always
created with status `DRAFT`) was invisible unless the admin manually clicked
into Inventory and switched to the Draft tab.

**Fix (1):** On success, `handleAddSingle` now does
`router.push('/admin/inventory?status=DRAFT')` instead of just setting local
success state — the admin lands straight on the Draft tab where the tree they
just added is listed. Removed the now-dead inline success card and its
`singleResult` state.

**Symptom (2 — QR code):**
Every inventory tree's "QR Code" panel showed a URL of the form
`https://vanamitra.in/tree/<uniqueId>`. That route never existed anywhere in
the app (only `/certificate/[shareToken]`, keyed by *dedication*, existed), so
the QR code — meant to be scanned off the tree's physical marker — 404'd
regardless of a tree's status. The domain was also hardcoded, so it would
never have worked from localhost/staging either.

**Root cause:** `qrCodeData` was generated at tree-creation time
(`POST /api/admin/inventory`) as a dead link — a route to back it was never
built.

**Fix (2):**
- New public route `src/app/tree/[uniqueId]/page.tsx` — what the QR code now
  actually points to. Looks the tree up by `uniqueId`; if it already has a
  dedication with a `shareToken`, redirects to the existing rich
  `/certificate/[shareToken]` page; otherwise renders a lightweight page
  (species, plot/location, photos, updates, a "Plant a tree" CTA) for trees
  still in `DRAFT`/`FREE`/`RESERVED`.
- `qrCodeData` generation in `src/app/api/admin/inventory/route.ts` now
  builds the URL from the request's own host (same `headers()` pattern used
  in `src/app/api/dedications/[id]/certificate/route.ts`) instead of a
  hardcoded `vanamitra.in`, so it resolves correctly in every environment.

**Note:** trees created *before* this fix still have the old
`https://vanamitra.in/tree/<uniqueId>` value stored in `qrCodeData`. Adding
the `/tree/[uniqueId]` route fixes those too, as long as `vanamitra.in`
actually resolves to this app in production — if it doesn't, those existing
rows need a backfill (see `src/app/api/admin/backfill-tokens/route.ts` for
the precedent of a one-off backfill route).

**Files:**
- `src/app/admin/inventory/new/page.tsx`
- `src/app/api/admin/inventory/route.ts`
- `src/app/tree/[uniqueId]/page.tsx` (new)

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
