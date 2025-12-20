'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function AgentDraftEditor({ draftId, initialContent, isEditable, status }) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)

    const saveContent = useCallback(async (content) => {
        setSaving(true)
        try {
            await fetch(`/api/agent/drafts/${draftId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })
            setLastSaved(new Date())
        } catch (error) {
            console.error('Save failed:', error)
        } finally {
            setSaving(false)
        }
    }, [draftId])

    const submitDraft = async () => {
        if (!editor) return

        setSubmitting(true)
        try {
            // Save content first
            await saveContent(editor.getHTML())

            // Then submit
            const res = await fetch(`/api/agent/drafts/${draftId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submit' }),
            })

            if (res.ok) {
                router.push('/agent/drafts')
                router.refresh()
            }
        } catch (error) {
            console.error('Submit failed:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent || '<p>Start writing your article...</p>',
        editable: isEditable,
    })

    const handleSave = () => {
        if (editor) {
            saveContent(editor.getHTML())
        }
    }

    if (!editor) {
        return <div className="editor-loading">Loading editor...</div>
    }

    return (
        <div className="agent-draft-editor">
            {isEditable && (
                <div className="editor-toolbar">
                    <div className="toolbar-buttons">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
                        >
                            Bold
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
                        >
                            Italic
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                        >
                            H2
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                        >
                            H3
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
                        >
                            Quote
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                        >
                            List
                        </button>
                    </div>
                </div>
            )}

            <div className="editor-content article-body">
                <EditorContent editor={editor} />
            </div>

            {isEditable && (
                <div className="editor-footer">
                    <div className="footer-status">
                        {lastSaved && (
                            <span className="save-status text-sm text-muted">
                                Last saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <div className="footer-actions">
                        <button onClick={handleSave} className="btn btn-secondary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button onClick={submitDraft} className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit for Review'}
                        </button>
                    </div>
                </div>
            )}

            {!isEditable && status === 'SUBMITTED' && (
                <div className="status-banner">
                    <p>This draft has been submitted and is awaiting editor review.</p>
                </div>
            )}

            {!isEditable && status === 'APPROVED' && (
                <div className="status-banner approved">
                    <p>This draft has been approved by the editor.</p>
                </div>
            )}

            <style jsx>{`
        .agent-draft-editor {
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          overflow: hidden;
        }
        
        .editor-toolbar {
          padding: var(--space-3) var(--space-4);
          background-color: var(--color-bg-alt);
          border-bottom: 1px solid var(--color-border-subtle);
        }
        
        .toolbar-buttons {
          display: flex;
          gap: var(--space-1);
        }
        
        .toolbar-btn {
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-sm);
          background: none;
          border: none;
          border-radius: 4px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .toolbar-btn:hover {
          background-color: var(--color-bg);
          color: var(--color-text);
        }
        
        .toolbar-btn.active {
          background-color: var(--color-bg);
          color: var(--color-accent);
        }
        
        .editor-content {
          padding: var(--space-8);
          min-height: 400px;
        }
        
        .editor-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4);
          background-color: var(--color-bg-alt);
          border-top: 1px solid var(--color-border-subtle);
        }
        
        .footer-actions {
          display: flex;
          gap: var(--space-3);
        }
        
        .status-banner {
          padding: var(--space-4);
          background-color: #FEF3C7;
          color: #92400E;
          text-align: center;
          font-size: var(--text-sm);
        }
        
        .status-banner.approved {
          background-color: #D1FAE5;
          color: #065F46;
        }
        
        .editor-loading {
          padding: var(--space-8);
          text-align: center;
          color: var(--color-text-muted);
        }
      `}</style>
        </div>
    )
}
