import prisma from '@/lib/db'
import HomeContent from '@/components/home/HomeContent'

export const dynamic = 'force-dynamic'

async function getFeaturedArticle() {
    try {
        const article = await prisma.article.findFirst({
            where: {
                publishedAt: { not: null },
                hidden: false,
                featured: true,
            },
            orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }],
        })
        return article
    } catch {
        return null
    }
}

async function getRecentArticles() {
    try {
        const articles = await prisma.article.findMany({
            where: {
                publishedAt: { not: null },
                hidden: false,
                featured: false,
            },
            orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }],
            take: 4,
        })
        return articles
    } catch {
        return []
    }
}

export default async function HomePage() {
    const featuredArticle = await getFeaturedArticle()
    const recentArticles = await getRecentArticles()

    return (
        <HomeContent
            featuredArticle={featuredArticle}
            recentArticles={recentArticles}
        />
    )
}
