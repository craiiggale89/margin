'use client'

import AgentDraftEditor from '@/components/agent/AgentDraftEditor'

export default function AgentDraftDetailContent({ draft, isEditable }) {
    return (
        <div className="agent-draft-detail">
            <header className="draft-header">
                <div className="draft-header-content">
                    {draft.pitch.contextLabel && (
                        <span className="context-label">{draft.pitch.contextLabel}</span>
                    )}
                    <h1 className="draft-title">{draft.pitch.title}</h1>
                    <p className="draft-standfirst">{draft.pitch.standfirst}</p>
                </div>
            </header>

            {draft.editorNotes && draft.status === 'REVISION_REQUESTED' && (
                <div className="editor-feedback">
                    <h3 className="feedback-title">Editor Feedback</h3>
                    <p>{draft.editorNotes}</p>
                </div>
            )}

            <AgentDraftEditor
                draftId={draft.id}
                initialContent={draft.content}
                isEditable={isEditable}
                status={draft.status}
            />

            <style jsx>{`
        .agent-draft-detail {
          max-width: 800px;
        }
        
        .draft-header {
          margin-bottom: var(--space-8);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--color-border-subtle);
        }
        
        .draft-title {
          font-size: var(--text-3xl);
          margin-top: var(--space-3);
          margin-bottom: var(--space-4);
        }
        
        .draft-standfirst {
          font-size: var(--text-lg);
          color: var(--color-text-secondary);
        }
        
        .editor-feedback {
          background-color: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 6px;
          padding: var(--space-5);
          margin-bottom: var(--space-6);
        }
        
        .feedback-title {
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: 600;
          color: #92400E;
          margin-bottom: var(--space-2);
        }
      `}</style>
        </div>
    )
}
