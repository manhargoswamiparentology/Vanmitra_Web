'use client'

export default function InvoicePrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn btn-ghost btn-sm"
    >
      Download invoice
    </button>
  )
}
