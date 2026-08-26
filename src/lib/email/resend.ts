import { Resend } from 'resend'

// Lazily constructed so builds without RESEND_API_KEY (e.g. CI type-check) don't crash.
let client: Resend | null = null

export function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }
    client = new Resend(apiKey)
  }
  return client
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Vanamitra <vanmittra@parentology.app>'
