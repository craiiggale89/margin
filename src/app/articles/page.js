import prisma from '@/lib/db'
import ArticlesContent from '@/components/articles/ArticlesContent'

export const metadata = {
    title: 'Articles | Margin',
    description: 'Writing on how performance in sport is built, expressed, and sometimes undone.',
}

async function getArticles(filter) {
    try {
        const where = {
            publishedAt: { not: null },
        }

        if (filter && filter !== 'all') {
            where.sportFilter = filter
        }

        const articles = await prisma.article.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
        })
        return articles
    } catch {
        return []
    }
}

export default async function ArticlesPage({ searchParams }) {
    const filter = searchParams?.filter || 'all'
    const articles = await getArticles(filter)

    return <ArticlesContent articles={articles} filter={filter} />
}
