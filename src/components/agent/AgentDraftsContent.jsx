'use client'

import Link from 'next/link'

const statusLabels = {
    DRAFT: 'In Progress',
    SUBMITTED: 'Submitted',
    IN_REVIEW: 'In Review',
    REVISION_REQUESTED: 'Needs Revision',
    APPROVED: 'Approved',
}

export default function AgentDraftsContent({ drafts, activeDrafts, submittedDrafts, completedDrafts }) {
    return (
        <div className="agent-drafts-page">
            <header className="admin-header">
                <h1 className="admin-title">My Drafts</h1>
            </header>

            {/* Active Drafts */}
            {activeDrafts.length > 0 && (
                <section className="draft-section">
                    <h2 className="section-title">Active</h2>
                    <div className="draft-list">
                        {activeDrafts.map((draft) => (
                            <Link
                                key={draft.id}
                                href={`/agent/drafts/${draft.id}`}
                                className="draft-card card"
                            >
                                <div className="draft-card-header">
                                    <h3 className="draft-card-title">{draft.pitch.title}</h3>
                                    <span className={`pitch-card-status ${draft.status === 'REVISION_REQUESTED' ? 'revision' : 'draft'}`}>
                                        {statusLabels[draft.status]}
                                    </span>
                                </div>
                                <p className="draft-standfirst">{draft.pitch.standfirst}</p>

                                {draft.status === 'REVISION_REQUESTED' && draft.editorNotes && (
                                    <div className="editor-feedback">
                                        <span className="feedback-label">Editor feedback:</span>
                                        <p>{draft.editorNotes}</p>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Submitted */}
            {submittedDrafts.length > 0 && (
                <section className="draft-section">
                    <h2 className="section-title">Awaiting Review</h2>
                    <div className="draft-list">
                        {submittedDrafts.map((draft) => (
                            <div key={draft.id} className="draft-card card draft-card-compact">
                                <div className="draft-card-header">
                                    <h3 className="draft-card-title">{draft.pitch.title}</h3>
                                    <span className="pitch-card-status submitted">
                                        {statusLabels[draft.status]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Completed */}
            {completedDrafts.length > 0 && (
                <section className="draft-section">
                    <h2 className="section-title">Completed</h2>
                    <div className="draft-list">
                        {completedDrafts.map((draft) => (
                            <div key={draft.id} className="draft-card card draft-card-compact">
                                <div className="draft-card-header">
                                    <h3 className="draft-card-title">{draft.pitch.title}</h3>
                                    <span className="pitch-card-status approved">
                                        {draft.article ? 'Published' : 'Approved'}
                                    </span>
                                </div>
                                {draft.article && (
                                    <Link
                                        href={`/articles/${draft.article.slug}`}
                                        target="_blank"
                                        className="view-link"
                                    >
                                        View published article →
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {drafts.length === 0 && (
                <div className="empty-state">
                    <p className="text-muted">No drafts yet. Get a pitch approved to start writing.</p>
                    <Link href="/agent/pitches/new" className="btn btn-primary">
                        Submit a Pitch
                    </Link>
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
        }
        
        .draft-card-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 500;
        }
        
        .draft-standfirst {
          color: var(--color-text-secondary);
          margin-top: var(--space-2);
          font-size: var(--text-base);
        }
        
        .editor-feedback {
          background-color: #FEF3C7;
          border-radius: 4px;
          padding: var(--space-3);
          margin-top: var(--space-4);
          font-size: var(--text-sm);
        }
        
        .feedback-label {
          font-weight: 500;
          color: #92400E;
        }
        
        .draft-card-compact {
          padding: var(--space-4);
        }
        
        .view-link {
          display: inline-block;
          margin-top: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-accent);
        }
        
        .pitch-card-status.draft {
          background-color: #E0E7FF;
          color: #3730A3;
        }
        
        .empty-state {
          text-align: center;
          padding: var(--space-16) 0;
        }
        
        .empty-state .btn {
          margin-top: var(--space-4);
        }
      `}</style>
        </div>
    )
}
