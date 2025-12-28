'use client'

import { useState } from 'react'
import DraftEditor from '@/components/admin/DraftEditor'
import DraftActions from '@/components/admin/DraftActions'

export default function AdminDraftDetailContent({ draft }) {
  const [isRefining, setIsRefining] = useState(false)
  const [refineFeedback, setRefineFeedback] = useState('')
  const [title, setTitle] = useState(draft.title || draft.pitch.title)
  const [standfirst, setStandfirst] = useState(draft.standfirst || draft.pitch.standfirst)
  const [isSavingHeader, setIsSavingHeader] = useState(false)

  const handleRefine = async () => {
    setIsRefining(true)
    try {
      const res = await fetch(`/api/admin/drafts/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refine',
          notes: refineFeedback
        }),
      })
      if (res.ok) {
        setRefineFeedback('')
        window.location.reload()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsRefining(false)
    }
  }

  const handleSaveHeader = async () => {
    setIsSavingHeader(true)
    try {
      const res = await fetch(`/api/admin/drafts/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, standfirst }),
      })
      if (res.ok) {
        // Success feedback could be added here
      }
    } catch (error) {
      console.error('Failed to save header:', error)
    } finally {
      setIsSavingHeader(false)
    }
  }

  return (
    <div className="draft-detail-page">
      <header className="draft-header">
        <div className="draft-header-content">
          <div className="header-edit-group">
            {draft.pitch.contextLabel && (
              <span className="context-label">{draft.pitch.contextLabel}</span>
            )}
            <input
              className="draft-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveHeader}
              placeholder="Article Title"
            />
            <textarea
              className="draft-standfirst-input"
              value={standfirst}
              onChange={(e) => setStandfirst(e.target.value)}
              onBlur={handleSaveHeader}
              placeholder="Article Standfirst"
              rows={2}
            />
          </div>
          <div className="metadata">
            <span>By {draft.pitch.agent.name}</span>
            <span className="metadata-separator"></span>
            <span>{draft.pitch.estimatedTime} min read</span>
            {isSavingHeader && <span className="save-indicator">Saving...</span>}
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

      {!draft.article && (
        <div className="refine-panel">
          <h3 className="refine-title">✨ Refine with AI</h3>
          <div className="refine-controls">
            <input
              type="text"
              className="refine-input"
              placeholder="e.g. 'Make the tone more serious', 'Expand on the second paragraph'..."
              value={refineFeedback}
              onChange={(e) => setRefineFeedback(e.target.value)}
              disabled={isRefining}
            />
            <button
              className="btn btn-secondary"
              onClick={handleRefine}
              disabled={isRefining || !refineFeedback}
            >
              {isRefining ? 'Refining...' : 'Refine Draft'}
            </button>
          </div>
        </div>
      )}

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

        .header-edit-group {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
            margin-top: var(--space-3);
            margin-bottom: var(--space-4);
        }

        .draft-title-input {
            font-family: var(--font-serif);
            font-size: var(--text-3xl);
            font-weight: 700;
            border: 1px solid transparent;
            background: transparent;
            width: 100%;
            padding: var(--space-1) 0;
            color: var(--color-text);
            outline: none;
            transition: border-color 0.2s;
        }

        .draft-title-input:hover, .draft-title-input:focus {
            border-bottom: 1px solid var(--color-border);
        }

        .draft-standfirst-input {
            font-family: var(--font-sans);
            font-size: var(--text-lg);
            color: var(--color-text-secondary);
            border: 1px solid transparent;
            background: transparent;
            width: 100%;
            padding: var(--space-1) 0;
            resize: none;
            outline: none;
            line-height: 1.5;
            transition: border-color 0.2s;
        }

        .draft-standfirst-input:hover, .draft-standfirst-input:focus {
            border-bottom: 1px solid var(--color-border);
        }

        .save-indicator {
            font-size: var(--text-xs);
            color: var(--color-text-muted);
            margin-left: var(--space-4);
            font-style: italic;
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

        .refine-panel {
            background: linear-gradient(to right, #fbfbfb, #f5f5f5);
            border: 1px solid var(--color-border-subtle);
            border-radius: 8px;
            padding: var(--space-4) var(--space-6);
            margin-bottom: var(--space-6);
        }

        .refine-title {
            font-size: var(--text-sm);
            font-weight: 600;
            color: #6366f1;
            margin-bottom: var(--space-3);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .refine-controls {
            display: flex;
            gap: var(--space-3);
        }

        .refine-input {
            flex: 1;
            padding: var(--space-2) var(--space-3);
            border: 1px solid var(--color-border);
            border-radius: 4px;
            font-size: var(--text-sm);
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
