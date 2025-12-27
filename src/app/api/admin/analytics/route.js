import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get time range from query params
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '7', 10)

        // Calculate date range
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // Get all page views in the time range
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

        // Calculate totals
        const totalViews = pageViews.length
        const uniqueSessions = new Set(pageViews.filter(pv => pv.sessionId).map(pv => pv.sessionId)).size

        // Calculate average duration (only for views with duration)
        const viewsWithDuration = pageViews.filter(pv => pv.duration !== null && pv.duration > 0)
        const avgDuration = viewsWithDuration.length > 0
            ? Math.round(viewsWithDuration.reduce((sum, pv) => sum + pv.duration, 0) / viewsWithDuration.length)
            : 0

        // Group views by day for chart
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

        // Convert to array sorted by date
        const dailyViews = Object.entries(viewsByDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))

        // Get top articles by views
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

        return NextResponse.json({
            totalViews,
            uniqueSessions,
            avgDuration,
            dailyViews,
            topArticles,
            days
        })
    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
