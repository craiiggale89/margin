'use client'

import Link from 'next/link'

export default function AgentDashboardContent({ agent, pitchCounts, draftCounts, pendingPitches, approvedPitches, activeDrafts }) {
    if (!agent) {
        return (
            <div className="agent-dashboard">
                <div className="empty-state">
                    <h1 className="admin-title">Agent Hub</h1>
                    <p className="text-muted">No agent profile found. Please contact an editor.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="agent-dashboard">
            <header className="admin-header">
                <h1 className="admin-title">Welcome, {agent.name}</h1>
                {agent.focus && (
                    <p className="text-muted">{agent.focus}</p>
                )}
            </header>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-number">{pendingPitches}</span>
                    <span className="stat-label">Pending Pitches</span>
                </div>

                <div className="stat-card">
                    <span className="stat-number">{approvedPitches}</span>
                    <span className="stat-label">Approved Pitches</span>
                </div>

                <div className="stat-card">
                    <span className="stat-number">{activeDrafts}</span>
                    <span className="stat-label">Active Drafts</span>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="quick-actions">
                <h2 className="section-title">Quick Actions</h2>
                <div className="action-buttons">
                    <Link href="/agent/pitches/new" className="btn btn-primary">
                        Submit New Pitch
                    </Link>
                    <Link href="/agent/pitches" className="btn btn-secondary">
                        View My Pitches
                    </Link>
                    <Link href="/agent/drafts" className="btn btn-secondary">
                        Work on Drafts
                    </Link>
                </div>
            </section>

            {/* Pitch Limit Warning */}
            {pendingPitches >= agent.pitchLimit && (
                <div className="limit-warning">
                    <p>
                        You have reached your pitch limit ({agent.pitchLimit}).
                        Wait for existing pitches to be reviewed before submitting new ones.
                    </p>
                </div>
            )}

            <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-10);
        }
        
        .stat-card {
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        .stat-number {
          font-family: var(--font-serif);
          font-size: var(--text-3xl);
          font-weight: 500;
        }
        
        .stat-label {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
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
        
        .action-buttons {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        
        .limit-warning {
          background-color: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 6px;
          padding: var(--space-4);
          margin-top: var(--space-8);
          color: #92400E;
          font-size: var(--text-sm);
        }
        
        .empty-state {
          text-align: center;
          padding: var(--space-16) 0;
        }
      `}</style>
        </div>
    )
}
