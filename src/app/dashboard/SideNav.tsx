'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SideNavProps {
  userName: string
  userInitials: string
  levelName: string
  treesToNext: number | null
  nextLevelName: string | null
  treeCount: number
  notesCount: number
  currentLevelTrees: number
  nextLevelTrees: number | null
}

const NAV_ITEMS = [
  { href: '/dashboard',              label: 'Home',             icon: '⌂',  countKey: null },
  { href: '/dashboard/trees',        label: 'Trees',            icon: '🌳', countKey: 'treeCount' as const },
  { href: '/dashboard/certificates', label: 'Certificates',     icon: '📜', countKey: null },
  { href: '/dashboard/notes',        label: 'Notes',            icon: '📝', countKey: 'notesCount' as const },
  { href: '/dashboard/badges',       label: 'Streaks & Badges', icon: '🏅', countKey: null },
  { href: '/dashboard/visits',       label: 'Visits',           icon: '🗓', countKey: null },
  { href: '/dashboard/account',      label: 'Account',          icon: '⚙', countKey: null },
]

export default function SideNav({
  userName,
  userInitials,
  levelName,
  treesToNext,
  nextLevelName,
  treeCount,
  notesCount,
  currentLevelTrees,
  nextLevelTrees,
}: SideNavProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const counts: Record<string, number> = { treeCount, notesCount }

  const progressPct =
    nextLevelTrees !== null
      ? Math.min(100, Math.round(((treeCount - currentLevelTrees) / (nextLevelTrees - currentLevelTrees)) * 100))
      : 100

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const currentPage = NAV_ITEMS.find(i => isActive(i.href))?.label ?? 'Dashboard'

  // ── Shared nav content (used in both sidebar and drawer) ──────────────────
  function NavContent({ onClose }: { onClose?: () => void }) {
    return (
      <>
        {/* Profile card */}
        <div style={{
          background: 'var(--paper-2)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '18px 16px',
          marginBottom: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--forest)', color: 'var(--paper)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--display)', fontWeight: 600, fontSize: 16,
              flexShrink: 0, letterSpacing: '-0.01em',
            }}>
              {userInitials}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 15, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 2 }}>
                {userName.split(' ')[0]}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--moss)' }}>
                {levelName}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 5, background: 'var(--line)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: 'linear-gradient(90deg, var(--moss), var(--terra))',
              borderRadius: 999, transition: 'width 600ms cubic-bezier(.2,.8,.2,1)',
            }} />
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
            {treesToNext !== null
              ? `${treesToNext} tree${treesToNext !== 1 ? 's' : ''} to ${nextLevelName}`
              : 'Max level reached'}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            const count = item.countKey ? counts[item.countKey] : null
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                  background: active ? 'var(--paper-2)' : 'transparent',
                  borderLeft: active ? '3px solid var(--terra)' : '3px solid transparent',
                  paddingLeft: active ? 11 : 14,
                  color: active ? 'var(--forest)' : 'var(--ink-soft)',
                  fontFamily: 'var(--display)', fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  transition: 'all 140ms',
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1, width: 20, textAlign: 'center', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {count !== null && count > 0 && (
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10,
                    background: active ? 'var(--forest)' : 'var(--paper-3)',
                    color: active ? 'var(--paper)' : 'var(--ink-mute)',
                    padding: '2px 7px', borderRadius: 999, letterSpacing: '0.04em',
                  }}>
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Streak nudge */}
        <div style={{
          marginTop: 8, background: 'var(--forest)', borderRadius: 14,
          padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontSize: 20 }}>🔥</div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 13, color: 'var(--paper)', marginBottom: 4 }}>
              Keep the streak
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 12, color: 'oklch(0.85 0.03 150)', lineHeight: 1.4 }}>
              Write a note or plan a visit this month.
            </div>
          </div>
          <Link
            href="/dashboard/notes"
            onClick={onClose}
            className="btn btn-terra btn-sm"
            style={{ fontSize: 12, padding: '7px 14px', alignSelf: 'flex-start' }}
          >
            Add a note
          </Link>
        </div>

        {/* Plant CTA */}
        <Link
          href="/plant"
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 4, justifyContent: 'center', fontSize: 13 }}
        >
          + Plant another tree
        </Link>
      </>
    )
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="dash-sidebar">
        <NavContent />
      </aside>

      {/* ── Mobile top bar (hamburger + page title) ──────────────────── */}
      <div className="dash-mobile-bar">
        <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>
          {currentPage}
        </div>
        <button
          className="dash-burger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="2" rx="1" fill="currentColor" />
            <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor" />
            <rect x="2" y="14" width="16" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* ── Mobile overlay backdrop ──────────────────────────────────── */}
      <div
        className={`dash-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />

      {/* ── Mobile slide-in drawer ───────────────────────────────────── */}
      <div className={`dash-drawer${drawerOpen ? ' open' : ''}`}>
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 500, color: 'var(--forest)', letterSpacing: '-0.01em' }}>
            Vanam<em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--moss)' }}>itra</em>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)',
              borderRadius: 8, width: 36, height: 36,
              display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <NavContent onClose={() => setDrawerOpen(false)} />
      </div>
    </>
  )
}
