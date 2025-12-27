import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const body = await request.json()
        const { articleId, sessionId, duration } = body

        if (!articleId) {
            return NextResponse.json({ error: 'articleId is required' }, { status: 400 })
        }

        // Verify article exists
        const article = await prisma.article.findUnique({
            where: { id: articleId },
            select: { id: true }
        })

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        // Get request headers for additional data
        const userAgent = request.headers.get('user-agent') || null
        const referrer = request.headers.get('referer') || null

        // Create page view record
        await prisma.pageView.create({
            data: {
                articleId,
                sessionId: sessionId || null,
                duration: duration ? Math.round(duration) : null,
                userAgent,
                referrer,
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error tracking page view:', error)
        return NextResponse.json({ error: 'Failed to track page view' }, { status: 500 })
    }
}
