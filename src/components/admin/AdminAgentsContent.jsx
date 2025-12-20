'use client'

import Link from 'next/link'

export default function AdminAgentsContent({ agents }) {
    return (
        <div className="agents-page">
            <header className="admin-header">
                <div className="header-row">
                    <h1 className="admin-title">Agents</h1>
                    <Link href="/admin/agents/new" className="btn btn-primary">
                        Create Agent
                    </Link>
                </div>
            </header>

            {agents.length > 0 ? (
                <div className="agents-list">
                    {agents.map((agent) => (
                        <div key={agent.id} className="agent-card card">
                            <div className="agent-header">
                                <div className="agent-info">
                                    <h3 className="agent-name">{agent.name}</h3>
                                    <span className={`agent-status ${agent.active ? 'active' : 'inactive'}`}>
                                        {agent.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {agent.focus && (
                                <p className="agent-focus text-muted">{agent.focus}</p>
                            )}

                            <div className="agent-meta">
                                <span>Pitch limit: {agent.pitchLimit}</span>
                                <span className="metadata-separator"></span>
                                <span>{agent._count.pitches} pitches submitted</span>
                            </div>

                            {agent.constraints && (
                                <div className="agent-constraints">
                                    <span className="constraints-label">Constraints:</span>
                                    <p className="text-sm">{agent.constraints}</p>
                                </div>
                            )}

                            <div className="agent-actions">
                                <Link href={`/admin/agents/${agent.id}`} className="btn btn-secondary btn-sm">
                                    Edit
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p className="text-muted">No agents yet. Create one to start receiving pitches.</p>
                </div>
            )}

            <style jsx>{`
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .agents-list {
          display: grid;
          gap: var(--space-4);
        }
        
        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-2);
        }
        
        .agent-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        
        .agent-name {
          font-family: var(--font-sans);
          font-size: var(--text-lg);
          font-weight: 600;
        }
        
        .agent-status {
          font-size: var(--text-xs);
          font-weight: 500;
          padding: var(--space-1) var(--space-2);
          border-radius: 3px;
        }
        
        .agent-status.active {
          background-color: #D1FAE5;
          color: #065F46;
        }
        
        .agent-status.inactive {
          background-color: #F3F4F6;
          color: #6B7280;
        }
        
        .agent-focus {
          margin-bottom: var(--space-3);
        }
        
        .agent-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--space-4);
        }
        
        .agent-constraints {
          background-color: var(--color-bg-alt);
          padding: var(--space-3);
          border-radius: 4px;
          margin-bottom: var(--space-4);
        }
        
        .constraints-label {
          font-size: var(--text-xs);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: var(--color-text-muted);
        }
        
        .agent-actions {
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
        }
        
        .btn-sm {
          padding: var(--space-2) var(--space-4);
        }
        
        .empty-state {
          padding: var(--space-16) 0;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
