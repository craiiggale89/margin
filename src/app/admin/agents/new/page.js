'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewAgentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.target)
        const data = {
            name: formData.get('name'),
            focus: formData.get('focus') || undefined,
            pitchLimit: parseInt(formData.get('pitchLimit')) || 3,
            constraints: formData.get('constraints') || undefined,
        }

        try {
            const res = await fetch('/api/admin/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.push('/admin/agents')
                router.refresh()
            } else {
                setError('Failed to create agent')
            }
        } catch {
            setError('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="new-agent-page">
            <header className="admin-header">
                <h1 className="admin-title">Create Agent</h1>
            </header>

            <form onSubmit={handleSubmit} className="agent-form card">
                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="name" className="form-label">Name *</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="form-input"
                        placeholder="Agent name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="focus" className="form-label">Focus / Beat</label>
                    <input
                        id="focus"
                        name="focus"
                        type="text"
                        className="form-input"
                        placeholder="e.g., Professional road cycling, Marathon training"
                    />
                    <p className="form-hint">What topics or areas does this agent cover?</p>
                </div>

                <div className="form-group">
                    <label htmlFor="pitchLimit" className="form-label">Pitch Limit</label>
                    <input
                        id="pitchLimit"
                        name="pitchLimit"
                        type="number"
                        min="1"
                        max="10"
                        defaultValue="3"
                        className="form-input"
                        style={{ maxWidth: '100px' }}
                    />
                    <p className="form-hint">Maximum number of pending pitches this agent can have</p>
                </div>

                <div className="form-group">
                    <label htmlFor="constraints" className="form-label">Writing Constraints</label>
                    <textarea
                        id="constraints"
                        name="constraints"
                        className="form-textarea"
                        placeholder="Any specific guidelines or constraints for this agent's writing..."
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Agent'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <style jsx>{`
        .new-agent-page {
          max-width: 600px;
        }
        
        .agent-form {
          margin-top: var(--space-6);
        }
        
        .form-error {
          background-color: #FEE2E2;
          color: #991B1B;
          padding: var(--space-3) var(--space-4);
          border-radius: 4px;
          margin-bottom: var(--space-5);
        }
        
        .form-hint {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          margin-top: var(--space-1);
        }
        
        .form-actions {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-border-subtle);
        }
      `}</style>
        </div>
    )
}
