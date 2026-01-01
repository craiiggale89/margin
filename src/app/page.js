import prisma from '@/lib/db'
import HomeContent from '@/components/home/HomeContent'

async function getFeaturedArticle() {
    try {
        const article = await prisma.article.findFirst({
            where: {
                publishedAt: { not: null },
                hidden: false,
                featured: true,
            },
            orderBy: [{ displayOrder: 'desc' }, { publishedAt: 'desc' }],
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
            orderBy: [{ displayOrder: 'desc' }, { publishedAt: 'desc' }],
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
