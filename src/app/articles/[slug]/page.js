import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import ArticleDetail from '@/components/articles/ArticleDetail'

export const dynamic = 'force-dynamic'

async function getArticle(slug) {
    try {
        const article = await prisma.article.findUnique({
            where: { slug },
        })
        return article
    } catch {
        return null
    }
}

async function getRelatedArticles(articleId) {
    try {
        const relations = await prisma.articleRelation.findMany({
            where: { fromId: articleId },
            include: { to: true },
            take: 3,
        })
        return relations.map(r => r.to)
    } catch {
        return []
    }
}

export async function generateMetadata({ params }) {
    const article = await getArticle(params.slug)

    if (!article) {
        return { title: 'Article Not Found | Margin' }
    }

    return {
        title: `${article.title} | Margin`,
        description: article.standfirst,
        openGraph: {
            title: article.title,
            description: article.standfirst,
            type: 'article',
            publishedTime: article.publishedAt?.toISOString(),
            authors: [article.byline],
        },
    }
}

export default async function ArticlePage({ params }) {
    const article = await getArticle(params.slug)

    if (!article || !article.publishedAt || article.hidden) {
        notFound()
    }

    const relatedArticles = await getRelatedArticles(article.id)

    return <ArticleDetail article={serializePrisma(article)} relatedArticles={serializePrisma(relatedArticles)} />
}
