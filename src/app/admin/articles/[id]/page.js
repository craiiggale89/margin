import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import AdminArticleEditContent from '@/components/admin/AdminArticleEditContent'

export const dynamic = 'force-dynamic'

async function getArticle(id) {
    try {
        const article = await prisma.article.findUnique({
            where: { id },
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
        return article
    } catch {
        return null
    }
}

export default async function ArticleEditPage({ params }) {
    const article = await getArticle(params.id)

    if (!article) {
        notFound()
    }

    return <AdminArticleEditContent article={serializePrisma(article)} />
}
