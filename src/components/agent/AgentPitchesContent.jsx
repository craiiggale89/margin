'use client'

import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

const statusLabels = {
    SUBMITTED: 'Submitted',
    IN_REVIEW: 'In Review',
    REVISION_REQUESTED: 'Revision Requested',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
}

const statusClasses = {
    SUBMITTED: 'submitted',
    IN_REVIEW: 'submitted',
    REVISION_REQUESTED: 'revision',
    APPROVED: 'approved',
    REJECTED: 'rejected',
}

export default function AgentPitchesContent({ activePitches, approvedPitches, rejectedPitches, pitchesLength }) {
    return (
        <div className="agent-pitches-page">
            <header className="admin-header">
                <div className="header-row">
                    <h1 className="admin-title">My Pitches</h1>
                    <Link href="/agent/pitches/new" className="btn btn-primary">
                        Submit Pitch
                    </Link>
                </div>
            </header>

            {/* Active Pitches */}
            {activePitches.length > 0 && (
                <section className="pitch-section">
                    <h2 className="section-title">Active</h2>
                    <div className="pitch-list">
                        {activePitches.map((pitch) => (
                            <div key={pitch.id} className="pitch-card card">
                                <div className="pitch-card-header">
                                    <h3 className="pitch-card-title">{pitch.title}</h3>
                                    <span className={`pitch-card-status ${statusClasses[pitch.status]}`}>
                                        {statusLabels[pitch.status]}
                                    </span>
                                </div>
                                <div className="pitch-card-meta">
                                    <span className="text-sm text-subtle">Submitted on {formatDateTime(pitch.createdAt)}</span>
                                </div>
                                <p className="pitch-standfirst">{pitch.standfirst}</p>

                                {pitch.status === 'REVISION_REQUESTED' && pitch.editorNotes && (
                                    <div className="editor-feedback">
                                        <span className="feedback-label">Editor feedback:</span>
                                        <p>{pitch.editorNotes}</p>
                                    </div>
                                )}

                                {pitch.status === 'APPROVED' && pitch.draft && (
                                    <div className="pitch-actions">
                                        <Link href={`/agent/drafts/${pitch.draft.id}`} className="btn btn-secondary">
                                            Work on Draft
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Approved */}
            {approvedPitches.length > 0 && (
                <section className="pitch-section">
                    <h2 className="section-title">Approved</h2>
                    <div className="pitch-list">
                        {approvedPitches.map((pitch) => (
                            <div key={pitch.id} className="pitch-card card pitch-card-compact">
                                <div className="pitch-card-header">
                                    <h3 className="pitch-card-title">{pitch.title}</h3>
                                    <span className="pitch-card-status approved">Approved</span>
                                </div>
                                <div className="pitch-card-meta">
                                    <span className="text-sm text-subtle">Submitted on {formatDateTime(pitch.createdAt)}</span>
                                </div>
                                {pitch.draft && (
                                    <Link href={`/agent/drafts/${pitch.draft.id}`} className="btn btn-ghost btn-sm">
                                        View Draft →
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Rejected */}
            {rejectedPitches.length > 0 && (
                <section className="pitch-section">
                    <h2 className="section-title">Rejected</h2>
                    <div className="pitch-list">
                        {rejectedPitches.map((pitch) => (
                            <div key={pitch.id} className="pitch-card card pitch-card-compact faded">
                                <div className="pitch-card-header">
                                    <h3 className="pitch-card-title">{pitch.title}</h3>
                                    <span className="pitch-card-status rejected">Rejected</span>
                                </div>
                                <div className="pitch-card-meta">
                                    <span className="text-sm text-subtle">Submitted on {formatDateTime(pitch.createdAt)}</span>
                                </div>
                                {pitch.editorNotes && (
                                    <p className="text-sm text-muted">{pitch.editorNotes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {pitchesLength === 0 && (
                <div className="empty-state">
                    <p className="text-muted">No pitches yet.</p>
                    <Link href="/agent/pitches/new" className="btn btn-primary">
                        Submit Your First Pitch
                    </Link>
                </div>
            )}

            <style jsx>{`
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .pitch-section {
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
        
        .pitch-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        
        .pitch-standfirst {
          color: var(--color-text-secondary);
          margin-top: var(--space-2);
        }
        
        .pitch-card-meta {
          margin-top: var(--space-1);
          margin-bottom: var(--space-2);
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
        
        .pitch-card-compact {
          padding: var(--space-4);
        }
        
        .pitch-card.faded {
          opacity: 0.7;
        }
        
        .pitch-actions {
          margin-top: var(--space-4);
        }
        
        .btn-sm {
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-sm);
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
