import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import ArticlesContent from '@/components/articles/ArticlesContent'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Articles | Margin',
    description: 'Writing on how performance in sport is built, expressed, and sometimes undone.',
}

async function getArticles(filter) {
    try {
        const where = {
            publishedAt: { not: null },
            hidden: false,
        }

        if (filter && filter !== 'all') {
            where.sportFilter = filter
        }

        const articles = await prisma.article.findMany({
            where,
            orderBy: [{ displayOrder: 'desc' }, { publishedAt: 'desc' }],
        })
        return articles
    } catch {
        return []
    }
}

export default async function ArticlesPage({ searchParams }) {
    const filter = searchParams?.filter || 'all'
    const articles = await getArticles(filter)

    return <ArticlesContent articles={serializePrisma(articles)} filter={filter} />
}
