import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/db'
import AdminAnalyticsContent from '@/components/admin/AdminAnalyticsContent'

export const dynamic = 'force-dynamic'

async function getAnalyticsData(days = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const pageViews = await prisma.pageView.findMany({
        where: {
            createdAt: { gte: startDate }
        },
        include: {
            article: {
                select: { id: true, title: true, slug: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const totalViews = pageViews.length
    const uniqueSessions = new Set(pageViews.filter(pv => pv.sessionId).map(pv => pv.sessionId)).size

    const viewsWithDuration = pageViews.filter(pv => pv.duration !== null && pv.duration > 0)
    const avgDuration = viewsWithDuration.length > 0
        ? Math.round(viewsWithDuration.reduce((sum, pv) => sum + pv.duration, 0) / viewsWithDuration.length)
        : 0

    // Group views by day
    const viewsByDay = {}
    for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateKey = date.toISOString().split('T')[0]
        viewsByDay[dateKey] = 0
    }

    pageViews.forEach(pv => {
        const dateKey = pv.createdAt.toISOString().split('T')[0]
        if (viewsByDay.hasOwnProperty(dateKey)) {
            viewsByDay[dateKey]++
        }
    })

    const dailyViews = Object.entries(viewsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

    // Top articles
    const articleViewCounts = {}
    pageViews.forEach(pv => {
        if (!articleViewCounts[pv.articleId]) {
            articleViewCounts[pv.articleId] = {
                id: pv.article.id,
                title: pv.article.title,
                slug: pv.article.slug,
                views: 0,
                totalDuration: 0,
                durationCount: 0
            }
        }
        articleViewCounts[pv.articleId].views++
        if (pv.duration) {
            articleViewCounts[pv.articleId].totalDuration += pv.duration
            articleViewCounts[pv.articleId].durationCount++
        }
    })

    const topArticles = Object.values(articleViewCounts)
        .map(article => ({
            ...article,
            avgDuration: article.durationCount > 0
                ? Math.round(article.totalDuration / article.durationCount)
                : null
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

    return {
        totalViews,
        uniqueSessions,
        avgDuration,
        dailyViews,
        topArticles,
        days
    }
}

export default async function AdminAnalyticsPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'EDITOR') {
        redirect('/login')
    }

    const data = await getAnalyticsData(7)

    return <AdminAnalyticsContent initialData={data} />
}
