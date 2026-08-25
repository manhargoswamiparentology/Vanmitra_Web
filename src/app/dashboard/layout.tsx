import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserLevel } from '@/data/constants'
import SideNav from './SideNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const [treeCount, notesCount] = await Promise.all([
    prisma.dedication.count({ where: { userId: session.userId } }),
    prisma.note.count({ where: { userId: session.userId } }),
  ])

  const { current, next } = getUserLevel(treeCount)
  const initials = session.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const treesToNext = next ? next.trees - treeCount : null

  return (
    <div className="dash-layout">
      <SideNav
        userName={session.name}
        userInitials={initials}
        levelName={current.name}
        treesToNext={treesToNext}
        nextLevelName={next?.name ?? null}
        treeCount={treeCount}
        notesCount={notesCount}
        currentLevelTrees={current.trees}
        nextLevelTrees={next?.trees ?? null}
      />

      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
