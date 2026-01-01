import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import AdminDraftDetailContent from '@/components/admin/AdminDraftDetailContent'

async function getDraft(id) {
    try {
        const draft = await prisma.draft.findUnique({
            where: { id },
            include: {
                pitch: {
                    include: {
                        agent: true,
                    },
                },
                article: true,
            },
        })
        return draft
    } catch (error) {
        console.error(`[Draft Page] Error fetching draft ${id}:`, error);
        throw error; // Let Next.js show an error page instead of a 404
    }
}

export default async function DraftDetailPage({ params }) {
    let draft = null;
    let error = null;

    try {
        draft = await getDraft(params.id)
    } catch (err) {
        error = err.message || 'Unknown database error';
        console.error(`[Draft Page] Render error for ${params.id}:`, err);
    }

    if (error) {
        return (
            <div className="error-container" style={{ padding: '40px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px' }}>Database Connection Issue</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                    The database is currently under high load (likely due to AI processing).
                </p>
                <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', textAlign: 'left', fontSize: '12px', fontFamily: 'monospace', marginBottom: '24px' }}>
                    Error: {error}
                </div>
                <button
                    onClick="window.location.reload()"
                    className="btn"
                    style={{ background: 'var(--color-text)', color: 'white', padding: '8px 24px', borderRadius: '4px', cursor: 'pointer', border: 'none' }}
                >
                    Try Refreshing
                </button>
            </div>
        );
    }

    if (!draft) {
        notFound()
    }

    return <AdminDraftDetailContent draft={draft} />
}
