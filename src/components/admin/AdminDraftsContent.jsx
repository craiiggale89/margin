'use client'

import Link from 'next/link'

const statusLabels = {
    DRAFT: 'In Progress',
    SUBMITTED: 'Submitted',
    IN_REVIEW: 'In Review',
    REVISION_REQUESTED: 'Revision Requested',
    APPROVED: 'Approved',
}

const statusClasses = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    IN_REVIEW: 'submitted',
    REVISION_REQUESTED: 'revision',
    APPROVED: 'approved',
}

export default function AdminDraftsContent({ drafts, submittedDrafts, otherDrafts }) {
    return (
        <div className="drafts-page">
            <header className="admin-header">
                <h1 className="admin-title">Drafts</h1>
                <p className="text-muted">{submittedDrafts.length} awaiting review</p>
            </header>

            {/* Submitted Drafts */}
            {submittedDrafts.length > 0 && (
                <section className="draft-section">
                    <h2 className="section-title">Ready for Review</h2>
                    <div className="draft-list">
                        {submittedDrafts.map((draft) => (
                            <Link
                                key={draft.id}
                                href={`/admin/drafts/${draft.id}`}
                                className="draft-card"
                            >
                                <div className="draft-card-header">
                                    <h3 className="draft-card-title">{draft.pitch.title}</h3>
                                    <span className={`pitch-card-status ${statusClasses[draft.status]}`}>
                                        {statusLabels[draft.status]}
                                    </span>
                                </div>
                                <p className="draft-standfirst">{draft.pitch.standfirst}</p>
                                <div className="draft-meta">
                                    <span>By {draft.pitch.agent.name}</span>
                                    <span className="metadata-separator"></span>
                                    <span>{draft.pitch.estimatedTime} min read</span>
                                    <span className="metadata-separator"></span>
                                    <span>Updated {new Date(draft.updatedAt).toLocaleDateString('en-GB')}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Other Drafts */}
            {otherDrafts.length > 0 && (
                <section className="draft-section">
                    <h2 className="section-title">All Drafts</h2>
                    <div className="draft-list">
                        {otherDrafts.map((draft) => (
                            <Link
                                key={draft.id}
                                href={`/admin/drafts/${draft.id}`}
                                className="draft-card draft-card-compact"
                            >
                                <div className="draft-card-header">
                                    <h3 className="draft-card-title">{draft.pitch.title}</h3>
                                    <span className={`pitch-card-status ${statusClasses[draft.status]}`}>
                                        {statusLabels[draft.status]}
                                    </span>
                                </div>
                                <span className="text-sm text-subtle">By {draft.pitch.agent.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {drafts.length === 0 && (
                <div className="empty-state">
                    <p className="text-muted">No drafts yet. Approve pitches to create drafts.</p>
                </div>
            )}

            <style jsx>{`
        .draft-section {
          margin-bottom: var(--space-10);
        }
        
        .section-title {
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: var(--color-text-muted);
          margin-bottom: var(--space-4);
        }
        
        .draft-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        
        .draft-card {
          display: block;
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          padding: var(--space-6);
          text-decoration: none;
          color: inherit;
          transition: border-color var(--transition-fast);
        }
        
        .draft-card:hover {
          border-color: var(--color-border);
        }
        
        .draft-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-3);
        }
        
        .draft-card-title {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 500;
        }
        
        .draft-standfirst {
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-4);
        }
        
        .draft-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }
        
        .draft-card-compact {
          padding: var(--space-4);
        }
        
        .draft-card-compact .draft-card-header {
          margin-bottom: var(--space-1);
        }
        
        .empty-state {
          padding: var(--space-16) 0;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
