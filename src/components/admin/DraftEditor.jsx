'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function DraftEditor({ draftId, initialContent, isReadOnly = false }) {
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)

    const saveContent = useCallback(async (content) => {
        setSaving(true)
        try {
            await fetch(`/api/admin/drafts/${draftId}`, {
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

    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent || '<p>Start writing...</p>',
        editable: !isReadOnly,
        onUpdate: ({ editor }) => {
            // Debounced auto-save could be added here
        },
    })

    // Update editor editable state when prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(!isReadOnly)
        }
    }, [isReadOnly, editor])

    const handleSave = () => {
        if (editor) {
            saveContent(editor.getHTML())
        }
    }

    if (!editor) {
        return <div className="editor-loading">Loading editor...</div>
    }

    return (
        <div className="draft-editor">
            {!isReadOnly && (
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

                    <div className="toolbar-actions">
                        {lastSaved && (
                            <span className="save-status text-sm text-muted">
                                Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                        <button onClick={handleSave} className="btn btn-secondary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            <div className="editor-content article-body">
                <EditorContent editor={editor} />
            </div>

            <style jsx>{`
        .draft-editor {
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          overflow: hidden;
        }
        
        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
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
        
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        
        .editor-content {
          padding: var(--space-8);
          min-height: 400px;
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
