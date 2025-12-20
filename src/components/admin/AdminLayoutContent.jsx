'use client'

import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayoutContent({ children, user }) {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Link href="/" className="admin-logo">Margin</Link>
                    <span className="admin-role-badge">Editor</span>
                </div>

                <AdminNav />

                <div className="admin-sidebar-footer">
                    <p className="admin-user-name">{user.name}</p>
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
        
        .admin-role-badge {
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--color-accent);
          background-color: rgba(114, 47, 55, 0.1);
          padding: var(--space-1) var(--space-2);
          border-radius: 3px;
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
