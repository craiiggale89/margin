import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import AdminDashboardContent from '@/components/admin/AdminDashboardContent'
import { getAllRecentHeadlines } from '@/lib/news'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  try {
    const [pendingPitches, draftsInReview, publishedArticles, recentArticles, agents, newsTopics] = await Promise.all([
      prisma.pitch.count({ where: { status: 'SUBMITTED' } }),
      prisma.draft.count({ where: { status: 'SUBMITTED' } }),
      prisma.article.count({ where: { publishedAt: { not: null } } }),
      prisma.article.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
      prisma.agent.findMany({ where: { active: true }, select: { id: true, name: true, focus: true } }),
      getAllRecentHeadlines(),
    ])

    return { pendingPitches, draftsInReview, publishedArticles, recentArticles, agents, newsTopics }
  } catch (error) {
    console.error(error)
    return { pendingPitches: 0, draftsInReview: 0, publishedArticles: 0, recentArticles: [], agents: [], newsTopics: {} }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return <AdminDashboardContent stats={serializePrisma(stats)} />
}
