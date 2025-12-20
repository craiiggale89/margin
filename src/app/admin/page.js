import prisma from '@/lib/db'
import AdminDashboardContent from '@/components/admin/AdminDashboardContent'

async function getDashboardStats() {
  try {
    const [pendingPitches, draftsInReview, publishedArticles, recentArticles] = await Promise.all([
      prisma.pitch.count({ where: { status: 'SUBMITTED' } }),
      prisma.draft.count({ where: { status: 'SUBMITTED' } }),
      prisma.article.count({ where: { publishedAt: { not: null } } }),
      prisma.article.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
    ])

    return { pendingPitches, draftsInReview, publishedArticles, recentArticles }
  } catch {
    return { pendingPitches: 0, draftsInReview: 0, publishedArticles: 0, recentArticles: [] }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  return <AdminDashboardContent stats={stats} />
}
