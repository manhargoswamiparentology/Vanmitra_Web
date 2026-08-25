import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Vanamitra — Dedicate a tree, grow a forest',
  description: 'Plant a tree in someone you love\'s name on our 10-acre farm in Kheda, Gujarat. GPS-tagged, photographed monthly, open every Saturday.',
  keywords: 'tree plantation, gift a tree, tree dedication, Kheda Gujarat, plant a tree India',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const user = session ? { name: session.name, isAdmin: session.isAdmin } : null

  return (
    <html lang="en">
      <body>
        <Nav user={user} />
        <main style={{ minHeight: '60vh' }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
