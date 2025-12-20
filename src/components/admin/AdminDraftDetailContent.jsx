'use client'

import DraftEditor from '@/components/admin/DraftEditor'
import DraftActions from '@/components/admin/DraftActions'

export default function AdminDraftDetailContent({ draft }) {
    return (
        <div className="draft-detail-page">
            <header className="draft-header">
                <div className="draft-header-content">
                    {draft.pitch.contextLabel && (
                        <span className="context-label">{draft.pitch.contextLabel}</span>
                    )}
                    <h1 className="draft-title">{draft.pitch.title}</h1>
                    <p className="draft-standfirst">{draft.pitch.standfirst}</p>
                    <div className="metadata">
                        <span>By {draft.pitch.agent.name}</span>
                        <span className="metadata-separator"></span>
                        <span>{draft.pitch.estimatedTime} min read</span>
                    </div>
                </div>

                <DraftActions
                    draftId={draft.id}
                    status={draft.status}
                    hasArticle={!!draft.article}
                />
            </header>

            <div className="draft-content">
                <DraftEditor
                    draftId={draft.id}
                    initialContent={draft.content}
                    isReadOnly={draft.status === 'APPROVED'}
                />
            </div>

            {draft.editorNotes && (
                <aside className="editor-notes">
                    <h3 className="notes-title">Editor Notes</h3>
                    <p>{draft.editorNotes}</p>
                </aside>
            )}

            <style jsx>{`
        .draft-detail-page {
          max-width: 800px;
        }
        
        .draft-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-8);
          margin-bottom: var(--space-8);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--color-border-subtle);
        }
        
        .draft-header-content {
          flex: 1;
        }
        
        .draft-title {
          font-size: var(--text-3xl);
          margin-top: var(--space-3);
          margin-bottom: var(--space-4);
        }
        
        .draft-standfirst {
          font-size: var(--text-lg);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-4);
        }
        
        .draft-content {
          margin-bottom: var(--space-8);
        }
        
        .editor-notes {
          background-color: var(--color-bg-alt);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          padding: var(--space-6);
        }
        
        .notes-title {
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: var(--color-text-muted);
          margin-bottom: var(--space-3);
        }
      `}</style>
        </div>
    )
}
