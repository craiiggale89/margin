import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextResponse } from 'next/server'
import { runSeoAudit } from '@/lib/seo-steward'

export const maxDuration = 60

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { articleId } = await request.json()

        const article = await prisma.article.findUnique({
            where: { id: articleId },
            include: {
                relatedTo: { include: { to: { select: { title: true, slug: true } } } },
            }
        })

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        // Run the SEO Steward audit
        const auditResult = await runSeoAudit(article)

        // Save the audit results
        await prisma.article.update({
            where: { id: articleId },
            data: {
                seoStatus: auditResult.status,
                seoNotes: auditResult.notes,
                seoLastReviewedAt: new Date(),
            }
        })

        return NextResponse.json({ success: true, audit: auditResult })
    } catch (error) {
        console.error('SEO Audit error:', error)
        return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
    }
}
