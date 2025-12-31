'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PitchActions({ pitchId }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const [notes, setNotes] = useState('')
    const [researchLoading, setResearchLoading] = useState(false)
    const [research, setResearch] = useState(null)

    const handleAction = async (action) => {
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/pitches/${pitchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, notes: notes || undefined }),
            })

            if (res.ok) {
                router.refresh()
                setShowNotes(false)
                setNotes('')
            }
        } catch (error) {
            console.error('Action failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleResearch = async () => {
        setResearchLoading(true)
        setResearch(null)

        try {
            const res = await fetch(`/api/admin/pitches/${pitchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'research' }),
            })

            if (res.ok) {
                const data = await res.json()
                setResearch(data.research)
            }
        } catch (error) {
            console.error('Research failed:', error)
        } finally {
            setResearchLoading(false)
        }
    }

    if (showNotes) {
        return (
            <div className="pitch-card-actions">
                <div className="notes-form">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes for the revision request..."
                        className="form-textarea notes-textarea"
                    />
                    <div className="notes-actions">
                        <button
                            onClick={() => handleAction('revision')}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            Send Revision Request
                        </button>
                        <button
                            onClick={() => setShowNotes(false)}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <style jsx>{`
          .notes-form {
            width: 100%;
          }
          
          .notes-textarea {
            min-height: 80px;
            margin-bottom: var(--space-3);
          }
          
          .notes-actions {
            display: flex;
            gap: var(--space-2);
          }
        `}</style>
            </div>
        )
    }

    return (
        <>
            <div className="pitch-card-actions">
                <button
                    onClick={handleResearch}
                    className={`btn btn-outline ${research ? 'btn-success' : ''}`}
                    disabled={researchLoading}
                >
                    {researchLoading ? 'Researching...' : research ? '✓ Research Done' : 'Gather Research'}
                </button>
                <button
                    onClick={() => handleAction('approve')}
                    className="btn btn-primary"
                    disabled={loading}
                >
                    Approve
                </button>
                <button
                    onClick={() => setShowNotes(true)}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Request Revision
                </button>
                <button
                    onClick={() => handleAction('reject')}
                    className="btn btn-ghost"
                    disabled={loading}
                >
                    Reject
                </button>
            </div>

            {research && research.anchors && research.anchors.length > 0 && (
                <div className="research-panel">
                    <div className="research-header">
                        <span>🔬 Research Gathered ({research.anchors.length} anchors)</span>
                        <button onClick={() => setResearch(null)} className="research-dismiss">✕</button>
                    </div>
                    <ul className="anchor-list">
                        {research.anchors.map((anchor, i) => (
                            <li key={i} className="anchor-item">
                                <strong>{anchor.type}:</strong> {anchor.situation}
                                <span className="anchor-consequence">→ {anchor.consequence}</span>
                            </li>
                        ))}
                    </ul>
                    {research.summary && (
                        <p className="research-summary">{research.summary}</p>
                    )}

                    <style jsx>{`
                        .research-panel {
                            margin-top: var(--space-4);
                            padding: var(--space-3);
                            background: var(--color-bg-elevated);
                            border: 1px solid var(--color-success);
                            border-radius: 6px;
                        }
                        .research-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: var(--space-2);
                            font-weight: 600;
                        }
                        .research-dismiss {
                            background: none;
                            border: none;
                            cursor: pointer;
                            opacity: 0.6;
                        }
                        .anchor-list {
                            margin: 0;
                            padding: 0;
                            list-style: none;
                        }
                        .anchor-item {
                            padding: var(--space-2);
                            border-bottom: 1px solid var(--color-border-subtle);
                            font-size: var(--text-sm);
                        }
                        .anchor-consequence {
                            display: block;
                            color: var(--color-text-muted);
                            margin-top: var(--space-1);
                        }
                        .research-summary {
                            font-size: var(--text-sm);
                            color: var(--color-text-muted);
                            margin-top: var(--space-2);
                            margin-bottom: 0;
                        }
                    `}</style>
                </div>
            )}
        </>
    )
}

