import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { metaDescription, canonicalUrl, noindex, seoStatus, seoNotes } = body

        const article = await prisma.article.update({
            where: { id: params.id },
            data: {
                ...(metaDescription !== undefined && { metaDescription }),
                ...(canonicalUrl !== undefined && { canonicalUrl }),
                ...(noindex !== undefined && { noindex }),
                ...(seoStatus !== undefined && { seoStatus }),
                ...(seoNotes !== undefined && { seoNotes }),
            }
        })

        return NextResponse.json({ success: true, article })
    } catch (error) {
        console.error('Error updating SEO:', error)
        return NextResponse.json({ error: 'Failed to update SEO' }, { status: 500 })
    }
}

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const article = await prisma.article.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                title: true,
                slug: true,
                metaDescription: true,
                canonicalUrl: true,
                noindex: true,
                seoStatus: true,
                seoNotes: true,
                seoLastReviewedAt: true,
            }
        })

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        return NextResponse.json(article)
    } catch (error) {
        console.error('Error fetching SEO:', error)
        return NextResponse.json({ error: 'Failed to fetch SEO data' }, { status: 500 })
    }
}
