'use client'

import { useState, useEffect } from 'react'

interface UserData {
  name: string
  email: string
  city: string
}

interface NotificationPref {
  key: string
  label: string
  description: string
}

const NOTIFICATION_PREFS: NotificationPref[] = [
  { key: 'monthlyPhotos',   label: 'Monthly photo updates',   description: 'Get a photo of your tree on the 1st of every month' },
  { key: 'badgeEarned',     label: 'New badge earned',        description: 'Notify me when I unlock a new achievement' },
  { key: 'visitReminders',  label: 'Visit reminders',         description: 'Reminder before the farm opens each Saturday' },
  { key: 'newNotes',        label: 'New notes',               description: 'Alert when the team adds a note to my tree' },
  { key: 'healthAlerts',    label: 'Tree health alerts',      description: 'Important updates about my tree\'s wellbeing' },
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 999,
        background: on ? 'var(--forest)' : 'var(--line)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 180ms',
        padding: 0,
      }}
    >
      <span
        style={{
          display: 'block',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'var(--paper)',
          position: 'absolute',
          top: 3,
          left: on ? 19 : 3,
          transition: 'left 180ms cubic-bezier(.2,.8,.2,1)',
          boxShadow: '0 1px 3px oklch(0 0 0 / 0.2)',
        }}
      />
    </button>
  )
}

export default function AccountPage() {
  const [user, setUser] = useState<UserData>({ name: '', email: '', city: '' })
  const [loading, setLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.key, true]))
  )

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) {
          setUser({ name: data.name, email: data.email, city: data.city || '' })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user.name.trim()) {
      setProfileMsg({ type: 'err', text: 'Name is required.' })
      return
    }
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name.trim(), city: user.city.trim() }),
      })
      if (res.ok) {
        setProfileMsg({ type: 'ok', text: 'Profile saved.' })
      } else {
        const d = await res.json().catch(() => ({}))
        setProfileMsg({ type: 'err', text: d?.error || 'Failed to save profile.' })
      }
    } catch {
      setProfileMsg({ type: 'err', text: 'Network error. Please try again.' })
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwMsg({ type: 'err', text: 'All password fields are required.' })
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'err', text: 'New passwords do not match.' })
      return
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ type: 'err', text: 'New password must be at least 8 characters.' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      if (res.ok) {
        setPwMsg({ type: 'ok', text: 'Password updated.' })
        setPwForm({ current: '', next: '', confirm: '' })
      } else {
        const d = await res.json().catch(() => ({}))
        setPwMsg({ type: 'err', text: d?.error || 'Failed to update password.' })
      }
    } catch {
      setPwMsg({ type: 'err', text: 'Network error. Please try again.' })
    } finally {
      setPwSaving(false)
    }
  }

  const msgStyle = (type: 'ok' | 'err'): React.CSSProperties => ({
    padding: '10px 14px',
    borderRadius: 8,
    fontFamily: 'var(--serif)',
    fontSize: 14,
    background: type === 'ok' ? 'oklch(0.55 0.09 145 / 0.1)' : 'oklch(0.62 0.13 45 / 0.1)',
    border: `1px solid ${type === 'ok' ? 'oklch(0.55 0.09 145 / 0.3)' : 'oklch(0.62 0.13 45 / 0.3)'}`,
    color: type === 'ok' ? 'var(--moss)' : 'var(--terra-deep)',
  })

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 300,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 640 }}>
      <div>
        <h3 style={{ marginBottom: 6 }}>Account</h3>
        <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', fontSize: 15 }}>
          Manage your profile and notification preferences.
        </p>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleProfileSave}
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          padding: '26px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 17,
            fontWeight: 500,
            color: 'var(--ink)',
          }}
        >
          Profile
        </div>

        {profileMsg && <div style={msgStyle(profileMsg.type)}>{profileMsg.text}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
              disabled={profileSaving}
              placeholder="Your full name"
            />
          </div>
          <div className="field">
            <label>City</label>
            <input
              type="text"
              value={user.city}
              onChange={(e) => setUser((u) => ({ ...u, city: e.target.value }))}
              disabled={profileSaving}
              placeholder="e.g. Ahmedabad"
            />
          </div>
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={profileSaving}
          >
            {profileSaving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>

      {/* Password form */}
      <form
        onSubmit={handlePasswordSave}
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          padding: '26px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 17,
            fontWeight: 500,
            color: 'var(--ink)',
          }}
        >
          Change password
        </div>

        {pwMsg && <div style={msgStyle(pwMsg.type)}>{pwMsg.text}</div>}

        <div className="field">
          <label>Current password</label>
          <input
            type="password"
            value={pwForm.current}
            onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
            disabled={pwSaving}
            autoComplete="current-password"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>New password</label>
            <input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
              disabled={pwSaving}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
            />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              disabled={pwSaving}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-outline btn-sm"
            disabled={pwSaving}
          >
            {pwSaving ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>

      {/* Notification toggles */}
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          padding: '26px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 17,
            fontWeight: 500,
            color: 'var(--ink)',
            marginBottom: 20,
          }}
        >
          Notifications
        </div>

        {NOTIFICATION_PREFS.map((pref, i) => (
          <div
            key={pref.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              padding: '14px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--line)',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: 3,
                }}
              >
                {pref.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 13,
                  color: 'var(--ink-mute)',
                }}
              >
                {pref.description}
              </div>
            </div>
            <Toggle
              on={notifPrefs[pref.key]}
              onChange={(v) => setNotifPrefs((p) => ({ ...p, [pref.key]: v }))}
            />
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div
        style={{
          background: 'oklch(0.62 0.13 45 / 0.05)',
          border: '1px solid oklch(0.62 0.13 45 / 0.2)',
          borderRadius: 18,
          padding: '22px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--terra-deep)',
              marginBottom: 4,
            }}
          >
            Sign out
          </div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 13,
              color: 'var(--ink-mute)',
            }}
          >
            You can always sign back in with your email.
          </div>
        </div>
        <a
          href="/api/auth/logout"
          className="btn btn-ghost btn-sm"
          style={{ borderColor: 'var(--terra)', color: 'var(--terra)' }}
        >
          Sign out
        </a>
      </div>
    </div>
  )
}
