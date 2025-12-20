'use client'

import Link from 'next/link'
import AgentNav from '@/components/agent/AgentNav'

export default function AgentLayoutContent({ children, user }) {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Link href="/" className="admin-logo">Margin</Link>
                    <span className="admin-role-badge agent-badge">Agent</span>
                </div>

                <AgentNav />

                <div className="admin-sidebar-footer">
                    <p className="admin-user-name">{user.name}</p>
                    {user.role === 'EDITOR' && (
                        <Link href="/admin" className="admin-switch-link">
                            Switch to Editor
                        </Link>
                    )}
                    <Link href="/api/auth/signout" className="admin-signout">
                        Sign out
                    </Link>
                </div>
            </aside>

            <main className="admin-main">
                {children}
            </main>

            <style jsx>{`
        .admin-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-8);
        }
        
        .admin-logo {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--color-text);
          text-decoration: none;
        }
        
        .agent-badge {
          background-color: rgba(107, 105, 102, 0.1);
          color: var(--color-text-secondary);
        }
        
        .admin-sidebar-footer {
          margin-top: auto;
          padding-top: var(--space-8);
          border-top: 1px solid var(--color-border-subtle);
        }
        
        .admin-user-name {
          font-size: var(--text-sm);
          font-weight: 500;
          margin-bottom: var(--space-2);
        }
        
        .admin-switch-link {
          display: block;
          font-size: var(--text-sm);
          color: var(--color-accent);
          margin-bottom: var(--space-2);
        }
        
        .admin-signout {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }
        
        .admin-signout:hover {
          color: var(--color-accent);
        }
      `}</style>
        </div>
    )
}
