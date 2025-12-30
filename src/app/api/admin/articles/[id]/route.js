import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextResponse } from 'next/server'
import { upgradeArticle } from '@/lib/ai'

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { action, title, standfirst, content, contextLabel, byline, imageUrl, featured, sportFilter } = body

        // Handle upgrade action
        if (action === 'upgrade') {
            const article = await prisma.article.findUnique({
                where: { id: params.id }
            })

            if (!article) {
                return NextResponse.json({ error: 'Article not found' }, { status: 404 })
            }

            const upgradedContent = await upgradeArticle({
                content: article.content,
                title: article.title,
                standfirst: article.standfirst
            })

            const updatedArticle = await prisma.article.update({
                where: { id: params.id },
                data: { content: upgradedContent }
            })

            return NextResponse.json({ success: true, article: updatedArticle })
        }

        // Regular update
        const article = await prisma.article.update({
            where: { id: params.id },
            data: {
                title,
                standfirst,
                content,
                contextLabel: contextLabel || null,
                byline,
                imageUrl: imageUrl || null,
                featured,
                sportFilter: sportFilter || null,
            }
        })

        return NextResponse.json({ success: true, article })
    } catch (error) {
        console.error('Error updating article:', error)
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
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
            include: {
                draft: {
                    include: {
                        pitch: {
                            include: {
                                agent: true,
                            },
                        },
                    },
                },
            },
        })

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        return NextResponse.json(article)
    } catch (error) {
        console.error('Error fetching article:', error)
        return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
    }
}
