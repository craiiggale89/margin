'use client'

import PitchActions from '@/components/admin/PitchActions'

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

export default function AdminPitchesContent({ pendingPitches, otherPitches, pitches }) {
    return (
        <div className="pitches-page">
            <header className="admin-header">
                <h1 className="admin-title">Pitches</h1>
                <p className="text-muted">{pendingPitches.length} pending review</p>
            </header>

            {/* Pending Pitches */}
            {pendingPitches.length > 0 && (
                <section className="pitch-section">
                    <h2 className="section-title">Pending Review</h2>
                    <div className="pitch-list">
                        {pendingPitches.map((pitch) => (
                            <div key={pitch.id} className="pitch-card">
                                <div className="pitch-card-header">
                                    <h3 className="pitch-card-title">{pitch.title}</h3>
                                    <span className={`pitch-card-status ${statusClasses[pitch.status]}`}>
                                        {statusLabels[pitch.status]}
                                    </span>
                                </div>

                                <div className="pitch-card-content">
                                    <div className="pitch-card-field">
                                        <span className="pitch-card-label">Standfirst</span>
                                        <p>{pitch.standfirst}</p>
                                    </div>

                                    <div className="pitch-card-field">
                                        <span className="pitch-card-label">Angle</span>
                                        <p>{pitch.angle}</p>
                                    </div>

                                    {pitch.whyNow && (
                                        <div className="pitch-card-field">
                                            <span className="pitch-card-label">Why Now</span>
                                            <p>{pitch.whyNow}</p>
                                        </div>
                                    )}

                                    <div className="pitch-meta">
                                        {pitch.contextLabel && (
                                            <span className="pitch-meta-item">
                                                <strong>Context:</strong> {pitch.contextLabel}
                                            </span>
                                        )}
                                        <span className="pitch-meta-item">
                                            <strong>Est. Read:</strong> {pitch.estimatedTime} min
                                        </span>
                                        <span className="pitch-meta-item">
                                            <strong>Agent:</strong> {pitch.agent.name}
                                        </span>
                                    </div>
                                </div>

                                <PitchActions pitchId={pitch.id} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Other Pitches */}
            {otherPitches.length > 0 && (
                <section className="pitch-section">
                    <h2 className="section-title">All Pitches</h2>
                    <div className="pitch-list">
                        {otherPitches.map((pitch) => (
                            <div key={pitch.id} className="pitch-card pitch-card-compact">
                                <div className="pitch-card-header">
                                    <h3 className="pitch-card-title">{pitch.title}</h3>
                                    <span className={`pitch-card-status ${statusClasses[pitch.status]}`}>
                                        {statusLabels[pitch.status]}
                                    </span>
                                </div>
                                <p className="pitch-card-standfirst text-muted">{pitch.standfirst}</p>
                                <span className="text-sm text-subtle">By {pitch.agent.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {pitches.length === 0 && (
                <div className="empty-state">
                    <p className="text-muted">No pitches yet.</p>
                </div>
            )}

            <style jsx>{`
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
        
        .pitch-card-compact {
          padding: var(--space-4);
        }
        
        .pitch-card-standfirst {
          font-size: var(--text-sm);
          margin-top: var(--space-2);
          margin-bottom: var(--space-2);
        }
        
        .pitch-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-4);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          margin-top: var(--space-4);
        }
        
        .empty-state {
          padding: var(--space-16) 0;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
