import prisma from '@/lib/db'
import AdminArticlesContent from '@/components/admin/AdminArticlesContent'

async function getArticles() {
    try {
        const articles = await prisma.article.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return articles
    } catch {
        return []
    }
}

export default async function AdminArticlesPage() {
    const articles = await getArticles()

    const publishedArticles = articles.filter(a => a.publishedAt)
    const scheduledArticles = articles.filter(a => !a.publishedAt && a.scheduledFor)

    return <AdminArticlesContent articles={articles} publishedArticles={publishedArticles} scheduledArticles={scheduledArticles} />
}
