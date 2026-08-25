import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'vanamitra-dev-secret-change-in-production'
)

const PROTECTED_PATHS = ['/dashboard', '/admin']
const AUTH_PATHS = ['/auth/login', '/auth/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('vanamitra_session')?.value

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))

  let session = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET)
      session = payload as { userId: string; isAdmin: boolean }
    } catch { /* invalid token */ }
  }

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (pathname.startsWith('/admin') && session && !session.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}
