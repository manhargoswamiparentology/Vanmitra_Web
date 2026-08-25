'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS: { href: string; label: string; exact?: boolean; group?: string }[] = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/inventory', label: 'Inventory', group: 'Trees' },
  { href: '/admin/inventory/new', label: '+ Add Trees' },
  { href: '/admin/trees', label: 'Bookings' },
  { href: '/admin/reminders', label: '🔔 Reminders', group: 'Manage' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/blog', label: 'Blog Posts' },
  { href: '/admin/waitlist', label: 'Waitlist' },
]

export default function AdminSideNav({ adminName }: { adminName: string }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    const path = href.split('?')[0]
    if (exact) return pathname === path
    return pathname.startsWith(path)
  }

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--forest-deep)',
        borderRight: '1px solid color-mix(in oklch, var(--forest) 40%, transparent)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '28px 20px 20px',
          borderBottom: '1px solid color-mix(in oklch, var(--paper) 10%, transparent)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'color-mix(in oklch, var(--paper) 45%, transparent)',
            marginBottom: 8,
          }}
        >
          Admin Panel
        </div>
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--paper)',
            letterSpacing: '-0.01em',
          }}
        >
          {adminName}
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--moss)',
            marginTop: 4,
          }}
        >
          Vanamitra
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 10px', flex: 1 }}>
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href, link.exact)
          return (
            <div key={link.href}>
              {link.group && (
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'color-mix(in oklch, var(--paper) 30%, transparent)',
                    padding: '14px 14px 4px',
                  }}
                >
                  {link.group}
                </div>
              )}
              <Link
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 2,
                  fontFamily: 'var(--display)',
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--paper)' : 'color-mix(in oklch, var(--paper) 60%, transparent)',
                  background: active
                    ? 'color-mix(in oklch, var(--paper) 12%, transparent)'
                    : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 160ms',
                  borderLeft: active ? '3px solid var(--gold)' : '3px solid transparent',
                }}
              >
                {link.label}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid color-mix(in oklch, var(--paper) 10%, transparent)',
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'color-mix(in oklch, var(--paper) 40%, transparent)',
            textDecoration: 'none',
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </aside>
  )
}
