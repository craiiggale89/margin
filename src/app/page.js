import prisma from '@/lib/db'
import HomeContent from '@/components/home/HomeContent'

async function getFeaturedArticle() {
    try {
        const article = await prisma.article.findFirst({
            where: {
                publishedAt: { not: null },
                featured: true, // Assuming one featured article at a time or logic to pick latest
            },
            orderBy: { publishedAt: 'desc' },
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
                featured: false,
            },
            orderBy: { publishedAt: 'desc' },
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
