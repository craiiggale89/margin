import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import AdminSeoContent from '@/components/admin/AdminSeoContent'

export const dynamic = 'force-dynamic'

async function getArticlesWithSeoData() {
    const articles = await prisma.article.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        include: {
            relatedTo: { include: { to: { select: { id: true, title: true, slug: true } } } },
            relatedFrom: { include: { from: { select: { id: true, title: true, slug: true } } } },
        }
    })

    // Count internal links in content for each article
    const articlesWithLinkCounts = articles.map(article => {
        // Count outbound internal links (to other Margin articles)
        const internalLinkRegex = /href=["']\/articles\/[^"']+["']/gi
        const contentLinks = (article.content.match(internalLinkRegex) || []).length

        return {
            ...article,
            internalLinksOut: contentLinks + article.relatedTo.length,
            internalLinksIn: article.relatedFrom.length,
        }
    })

    return articlesWithLinkCounts
}

export default async function SeoPage() {
    const articles = await getArticlesWithSeoData()

    return <AdminSeoContent articles={serializePrisma(articles)} />
}
