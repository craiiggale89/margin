'use client'

import Link from 'next/link'

export default function AdminDashboardContent({ stats }) {
    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1 className="admin-title">Dashboard</h1>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <Link href="/admin/pitches" className="stat-card">
                    <span className="stat-number">{stats.pendingPitches}</span>
                    <span className="stat-label">Pending Pitches</span>
                </Link>

                <Link href="/admin/drafts" className="stat-card">
                    <span className="stat-number">{stats.draftsInReview}</span>
                    <span className="stat-label">Drafts to Review</span>
                </Link>

                <div className="stat-card">
                    <span className="stat-number">{stats.publishedArticles}</span>
                    <span className="stat-label">Published Articles</span>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="quick-actions">
                <h2 className="section-title">Quick Actions</h2>
                <div className="action-buttons">
                    <Link href="/admin/pitches" className="btn btn-secondary">
                        Review Pitches
                    </Link>
                    <Link href="/admin/drafts" className="btn btn-secondary">
                        Review Drafts
                    </Link>
                    <Link href="/admin/agents" className="btn btn-secondary">
                        Manage Agents
                    </Link>
                </div>
            </section>

            {/* Recent Articles */}
            {stats.recentArticles.length > 0 && (
                <section className="recent-articles">
                    <h2 className="section-title">Recently Published</h2>
                    <ul className="article-list-compact">
                        {stats.recentArticles.map((article) => (
                            <li key={article.id}>
                                <Link href={`/admin/articles/${article.id}`} className="article-link">
                                    <span className="article-link-title">{article.title}</span>
                                    <span className="article-link-date text-muted">
                                        {article.publishedAt && new Date(article.publishedAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-10);
        }
        
        .stat-card {
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          padding: var(--space-6);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          transition: border-color var(--transition-fast);
        }
        
        .stat-card:hover {
          border-color: var(--color-border);
        }
        
        .stat-number {
          font-family: var(--font-serif);
          font-size: var(--text-4xl);
          font-weight: 500;
          color: var(--color-text);
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
        
        .quick-actions {
          margin-bottom: var(--space-10);
        }
        
        .action-buttons {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        
        .article-list-compact {
          list-style: none;
        }
        
        .article-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border-subtle);
          text-decoration: none;
          color: inherit;
          transition: color var(--transition-fast);
        }
        
        .article-link:hover .article-link-title {
          color: var(--color-accent);
        }
        
        .article-link-title {
          font-weight: 500;
          transition: color var(--transition-fast);
        }
        
        .article-link-date {
          font-size: var(--text-sm);
        }
      `}</style>
        </div>
    )
}
