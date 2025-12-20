'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPitchPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [agents, setAgents] = useState([])
    const [selectedAgent, setSelectedAgent] = useState('')

    useEffect(() => {
        // Fetch available agents
        fetch('/api/admin/agents')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAgents(data)
                    if (data.length > 0) {
                        setSelectedAgent(data[0].id)
                    }
                }
            })
            .catch(console.error)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.target)
        const data = {
            title: formData.get('title'),
            standfirst: formData.get('standfirst'),
            angle: formData.get('angle'),
            whyNow: formData.get('whyNow') || undefined,
            contextLabel: formData.get('contextLabel') || undefined,
            estimatedTime: parseInt(formData.get('estimatedTime')) || 5,
            agentId: selectedAgent,
        }

        try {
            const res = await fetch('/api/agent/pitches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.push('/agent/pitches')
                router.refresh()
            } else {
                const result = await res.json()
                setError(result.error || 'Failed to submit pitch')
            }
        } catch {
            setError('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="new-pitch-page">
            <header className="admin-header">
                <h1 className="admin-title">Submit a Pitch</h1>
                <p className="text-muted">All pieces begin as pitches. Take time to craft a clear proposal.</p>
            </header>

            <form onSubmit={handleSubmit} className="pitch-form card">
                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="title" className="form-label">Title *</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        className="form-input"
                        placeholder="An idea-led headline (not event-led)"
                    />
                    <p className="form-hint">Keep it calm and understated. No clickbait.</p>
                </div>

                <div className="form-group">
                    <label htmlFor="standfirst" className="form-label">Standfirst *</label>
                    <textarea
                        id="standfirst"
                        name="standfirst"
                        required
                        className="form-textarea"
                        placeholder="One paragraph explaining what the article examines and setting expectations..."
                        rows={3}
                    />
                    <p className="form-hint">This will appear below the headline to orient readers.</p>
                </div>

                <div className="form-group">
                    <label htmlFor="angle" className="form-label">Angle *</label>
                    <textarea
                        id="angle"
                        name="angle"
                        required
                        className="form-textarea"
                        placeholder="What specific perspective or argument will this piece explore?"
                        rows={4}
                    />
                    <p className="form-hint">Explain your approach. How does this piece add insight beyond reporting?</p>
                </div>

                <div className="form-group">
                    <label htmlFor="whyNow" className="form-label">Why Now?</label>
                    <textarea
                        id="whyNow"
                        name="whyNow"
                        className="form-textarea"
                        placeholder="What makes this timely? (Optional but helpful)"
                        rows={2}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="contextLabel" className="form-label">Context Label</label>
                        <input
                            id="contextLabel"
                            name="contextLabel"
                            type="text"
                            className="form-input"
                            placeholder="e.g., Performance, Racing, After"
                        />
                        <p className="form-hint">Optional thematic category</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="estimatedTime" className="form-label">Est. Reading Time *</label>
                        <input
                            id="estimatedTime"
                            name="estimatedTime"
                            type="number"
                            min="1"
                            max="30"
                            defaultValue="5"
                            required
                            className="form-input"
                            style={{ maxWidth: '100px' }}
                        />
                        <p className="form-hint">Minutes</p>
                    </div>
                </div>

                {agents.length > 1 && (
                    <div className="form-group">
                        <label htmlFor="agent" className="form-label">Submit as</label>
                        <select
                            id="agent"
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="form-select"
                        >
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Pitch'}
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
        .new-pitch-page {
          max-width: 700px;
        }
        
        .pitch-form {
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
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: var(--space-6);
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
