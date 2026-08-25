import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSideNav from './AdminSideNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || !session.isAdmin) redirect('/dashboard')

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--paper)',
      }}
    >
      <AdminSideNav adminName={session.name} />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: '40px 48px',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}
