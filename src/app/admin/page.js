import prisma from '@/lib/db'
import AdminDashboardContent from '@/components/admin/AdminDashboardContent'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  try {
    const [pendingPitches, draftsInReview, publishedArticles, recentArticles, agents] = await Promise.all([
      prisma.pitch.count({ where: { status: 'SUBMITTED' } }),
      prisma.draft.count({ where: { status: 'SUBMITTED' } }),
      prisma.article.count({ where: { publishedAt: { not: null } } }),
      prisma.article.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
      prisma.agent.findMany({ where: { active: true }, select: { id: true, name: true, focus: true } }),
    ])

    return { pendingPitches, draftsInReview, publishedArticles, recentArticles, agents }
  } catch {
    return { pendingPitches: 0, draftsInReview: 0, publishedArticles: 0, recentArticles: [], agents: [] }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  return <AdminDashboardContent stats={stats} />
}
