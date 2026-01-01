'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminArticlesContent({ articles, publishedArticles, scheduledArticles }) {
    const router = useRouter()
    const [upgradingId, setUpgradingId] = useState(null)
    const [upgradedIds, setUpgradedIds] = useState(new Set())

    const handleUpgrade = async (articleId) => {
        setUpgradingId(articleId)
        try {
            const res = await fetch(`/api/admin/articles/${articleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'upgrade' }),
            })

            if (res.ok) {
                setUpgradedIds(prev => new Set([...prev, articleId]))
                router.refresh()
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Upgrade failed: ${errorData.error || res.statusText}`);
            }
        } catch (error) {
            console.error('Upgrade failed:', error)
            alert('Upgrade failed: Network error or timeout');
        } finally {
            setUpgradingId(null)
        }
    }

    return (
        <div className="admin-articles-page">
            <header className="admin-header">
                <h1 className="admin-title">Articles</h1>
                <p className="text-muted">{publishedArticles.length} published</p>
            </header>

            {/* Published Articles */}
            {publishedArticles.length > 0 && (
                <section className="articles-section">
                    <h2 className="section-title">Published</h2>
                    <div className="articles-table">
                        <div className="table-header">
                            <span className="col-title">Title</span>
                            <span className="col-date">Published</span>
                            <span className="col-featured">Featured</span>
                            <span className="col-actions">Actions</span>
                        </div>
                        {publishedArticles.map((article) => (
                            <div key={article.id} className="table-row">
                                <div className="col-title">
                                    <Link href={`/articles/${article.slug}`} target="_blank" className="article-title-link">
                                        {article.title}
                                    </Link>
                                    {article.contextLabel && (
                                        <span className="context-label">{article.contextLabel}</span>
                                    )}
                                </div>
                                <span className="col-date text-muted">
                                    {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className="col-featured">
                                    {article.featured && <span className="featured-badge">★</span>}
                                </span>
                                <div className="col-actions">
                                    <button
                                        onClick={() => handleUpgrade(article.id)}
                                        disabled={upgradingId === article.id || upgradedIds.has(article.id)}
                                        className={`btn btn-outline btn-sm ${upgradedIds.has(article.id) ? 'btn-success' : ''}`}
                                    >
                                        {upgradingId === article.id ? 'Upgrading...' : upgradedIds.has(article.id) ? '✓ Draft Created' : 'Upgrade'}
                                    </button>
                                    <Link href={`/admin/articles/${article.id}`} className="btn btn-ghost btn-sm">
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Scheduled Articles */}
            {scheduledArticles.length > 0 && (
                <section className="articles-section">
                    <h2 className="section-title">Scheduled</h2>
                    <div className="articles-table">
                        {scheduledArticles.map((article) => (
                            <div key={article.id} className="table-row">
                                <div className="col-title">
                                    <span className="article-title-link">{article.title}</span>
                                </div>
                                <span className="col-date text-muted">
                                    Scheduled for {new Date(article.scheduledFor).toLocaleDateString('en-GB')}
                                </span>
                                <span className="col-featured"></span>
                                <div className="col-actions">
                                    <Link href={`/admin/articles/${article.id}`} className="btn btn-ghost btn-sm">
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {articles.length === 0 && (
                <div className="empty-state">
                    <p className="text-muted">No articles yet. Publish drafts to see them here.</p>
                </div>
            )}

            <style jsx>{`
        .articles-section {
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
        
        .articles-table {
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          overflow: hidden;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 1fr 120px 80px 160px;
          gap: var(--space-4);
          padding: var(--space-3) var(--space-4);
          background-color: var(--color-bg-alt);
          font-size: var(--text-xs);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: var(--color-text-muted);
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 1fr 120px 80px 160px;
          gap: var(--space-4);
          padding: var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
          align-items: center;
        }
        
        .article-title-link {
          font-weight: 500;
          color: var(--color-text);
          text-decoration: none;
        }
        
        .article-title-link:hover {
          color: var(--color-accent);
        }
        
        .col-title .context-label {
          display: block;
          margin-top: var(--space-1);
        }
        
        .featured-badge {
          color: var(--color-accent);
        }
        
        .btn-sm {
          padding: var(--space-1) var(--space-3);
          font-size: var(--text-sm);
        }
        
        .col-actions {
          display: flex;
          gap: var(--space-2);
        }
        
        .btn-success {
          border-color: var(--color-success);
          color: var(--color-success);
        }
        
        .empty-state {
          padding: var(--space-16) 0;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
