'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface NavProps {
  user?: { name: string; isAdmin: boolean } | null
}

export default function Nav({ user }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/',           label: 'Home' },
    { href: '/plant',      label: 'Dedicate a tree' },
    { href: '/journal',    label: 'Journal' },
    { href: '/farm',       label: 'Our farm' },
    { href: '/corporate',  label: 'Corporate' },
  ]

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">

          {/* Brand */}
          <Link href="/" className="brand">
            <Image
              src="/logo.png"
              alt="Vanamitra"
              width={36}
              height={36}
              style={{ objectFit: 'contain', display: 'block' }}
            />
            <span className="brand-name">Van<em>amitra</em></span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname === l.href ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="nav-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                {user.isAdmin && (
                  <Link href="/admin" className="nav-link" style={{ fontSize: 13, color: 'var(--terra)' }}>
                    Admin
                  </Link>
                )}
                <Link href={user.isAdmin ? '/admin' : '/dashboard'} className="nav-link">
                  {user.name.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="nav-link">Sign in</Link>
                <Link href="/plant" className="nav-cta">
                  Plant a tree
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="3" width="16" height="2" rx="1" fill="currentColor" />
                <rect x="1" y="8" width="16" height="2" rx="1" fill="currentColor" />
                <rect x="1" y="13" width="16" height="2" rx="1" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu overlay */}
      <div className={`nav-mobile-overlay${menuOpen ? ' open' : ''}`}>

        {/* Overlay header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 0', borderBottom: '1px solid var(--line)', marginBottom: 28,
          position: 'sticky', top: 0,
          background: 'color-mix(in oklch, var(--paper) 97%, transparent)',
          backdropFilter: 'blur(16px)',
        }}>
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <Image src="/logo.png" alt="Vanamitra" width={36} height={36} style={{ objectFit: 'contain', display: 'block' }} />
            <span className="brand-name">Van<em>amitra</em></span>
          </Link>
          <button
            className="nav-burger"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{ display: 'grid' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--display)',
                fontSize: 26,
                fontWeight: pathname === l.href ? 500 : 400,
                color: pathname === l.href ? 'var(--forest)' : 'var(--ink)',
                textDecoration: 'none',
                padding: '12px 0',
                borderBottom: '1px solid var(--line)',
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {l.label}
              {pathname === l.href && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--terra)', flexShrink: 0 }} />
              )}
            </Link>
          ))}

          {/* User links */}
          {user ? (
            <>
              {!user.isAdmin && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'var(--display)', fontSize: 26, fontWeight: 400,
                  color: 'var(--ink)', textDecoration: 'none',
                  padding: '12px 0', borderBottom: '1px solid var(--line)',
                  letterSpacing: '-0.01em',
                }}
              >
                My forest
              </Link>
              )}
              {user.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--display)', fontSize: 26, fontWeight: 400,
                    color: 'var(--terra)', textDecoration: 'none',
                    padding: '12px 0', borderBottom: '1px solid var(--line)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Admin
                </Link>
              )}
            </>
          ) : null}
        </div>

        {/* Bottom actions */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user ? (
            <>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 4 }}>
                Signed in as {user.name.split(' ')[0]}
              </div>
              <Link href="/plant" className="btn btn-primary btn-lg" onClick={() => setMenuOpen(false)}
                style={{ justifyContent: 'center' }}>
                Plant a tree
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/plant" className="btn btn-primary btn-lg" onClick={() => setMenuOpen(false)}
                style={{ justifyContent: 'center' }}>
                Plant a tree
              </Link>
              <Link href="/auth/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}
                style={{ justifyContent: 'center' }}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
