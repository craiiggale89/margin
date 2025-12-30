import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import AdminArticleEditContent from '@/components/admin/AdminArticleEditContent'

export const dynamic = 'force-dynamic'

async function getArticle(idOrSlug) {
    try {
        console.log(`[ArticleEdit] Fetching article with ID/Slug: ${idOrSlug}`);

        // Try finding by ID first
        let article = await prisma.article.findUnique({
            where: { id: idOrSlug },
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
        });

        // Fallback to slug if not found by ID
        if (!article) {
            console.log(`[ArticleEdit] Not found by ID, trying slug: ${idOrSlug}`);
            article = await prisma.article.findUnique({
                where: { slug: idOrSlug },
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
            });
        }

        return article
    } catch (error) {
        console.error(`[ArticleEdit] Error fetching article ${idOrSlug}:`, error);
        return null
    }
}

export default async function ArticleEditPage({ params }) {
    const { id } = params
    const article = await getArticle(id)

    if (!article) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>Article Not Found</h1>
                <p>Attempted to load article with ID: <code>{id}</code></p>
                <p>This could be due to a missing record or a database error. Check the server logs for more details.</p>
                <a href="/admin/articles">Back to Articles</a>
            </div>
        )
    }

    return <AdminArticleEditContent article={serializePrisma(article)} />
}
