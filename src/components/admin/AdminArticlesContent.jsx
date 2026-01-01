'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminArticlesContent({ articles, publishedArticles, scheduledArticles }) {
    const router = useRouter()
    const [upgradingId, setUpgradingId] = useState(null)
    const [upgradedIds, setUpgradedIds] = useState(new Map())
    const [togglingId, setTogglingId] = useState(null)
    const [orderingId, setOrderingId] = useState(null)

    // Separate visible and hidden articles
    const visibleArticles = publishedArticles.filter(a => !a.hidden)
    const hiddenArticles = publishedArticles.filter(a => a.hidden)

    const handleUpgrade = async (articleId) => {
        setUpgradingId(articleId)
        try {
            const res = await fetch(`/api/admin/articles/${articleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'upgrade' }),
            })
            if (res.ok) {
                const data = await res.json();
                setUpgradedIds(prev => {
                    const next = new Map(prev);
                    next.set(articleId, data.draftId);
                    return next;
                });
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

    const handleToggleVisibility = async (articleId, isCurrentlyHidden) => {
        setTogglingId(articleId)
        try {
            const res = await fetch(`/api/admin/articles/${articleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isCurrentlyHidden ? 'show' : 'hide' }),
            })
            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Toggle failed:', error)
        } finally {
            setTogglingId(null)
        }
    }

    const handleOrderChange = async (articleId, newOrder) => {
        setOrderingId(articleId)
        try {
            const res = await fetch(`/api/admin/articles/${articleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reorder', displayOrder: parseInt(newOrder) || 0 }),
            })
            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Reorder failed:', error)
        } finally {
            setOrderingId(null)
        }
    }

    const ArticleRow = ({ article, isHidden = false }) => (
        <div className={`table-row ${isHidden ? 'row-hidden' : ''}`}>
            <div className="col-title">
                <div className="title-row">
                    {article.featured && <span className="featured-badge">★</span>}
                    <Link href={`/articles/${article.slug}`} target="_blank" className="article-title-link">
                        {article.title}
                    </Link>
                </div>
                {article.contextLabel && (
                    <span className="context-label">{article.contextLabel}</span>
                )}
            </div>
            <span className="col-date">
                {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short'
                })}
            </span>
            <input
                type="number"
                className="order-input"
                defaultValue={article.displayOrder || 0}
                onBlur={(e) => handleOrderChange(article.id, e.target.value)}
                disabled={orderingId === article.id}
                title="Lower = appears first"
                min="0"
            />
            <div className="col-actions">
                <button
                    onClick={() => handleToggleVisibility(article.id, isHidden)}
                    disabled={togglingId === article.id}
                    className={`action-btn ${isHidden ? 'action-show' : 'action-hide'}`}
                    title={isHidden ? 'Show on site' : 'Hide from site'}
                >
                    {togglingId === article.id ? '•••' : isHidden ? '👁' : '🙈'}
                </button>
                <button
                    onClick={() => handleUpgrade(article.id)}
                    disabled={upgradingId === article.id || upgradedIds.has(article.id)}
                    className="action-btn"
                    title="Upgrade with AI"
                >
                    {upgradingId === article.id ? '•••' : upgradedIds.has(article.id) ? '✓' : '↑'}
                </button>
                <Link href={`/admin/articles/${article.id}`} className="action-btn" title="Edit">
                    ✏️
                </Link>
            </div>
        </div>
    )

    return (
        <div className="admin-articles-page">
            <header className="admin-header">
                <h1 className="admin-title">Articles</h1>
                <p className="text-muted">{visibleArticles.length} visible, {hiddenArticles.length} hidden</p>
            </header>

            {/* Visible Articles */}
            {visibleArticles.length > 0 && (
                <section className="articles-section">
                    <h2 className="section-title">Published</h2>
                    <div className="articles-table">
                        <div className="table-header">
                            <span>Title</span>
                            <span>Date</span>
                            <span>#</span>
                            <span>Actions</span>
                        </div>
                        {visibleArticles.map((article) => (
                            <ArticleRow key={article.id} article={article} isHidden={false} />
                        ))}
                    </div>
                </section>
            )}

            {/* Hidden Articles */}
            {hiddenArticles.length > 0 && (
                <section className="articles-section">
                    <h2 className="section-title section-title-hidden">Hidden</h2>
                    <div className="articles-table articles-table-hidden">
                        <div className="table-header">
                            <span>Title</span>
                            <span>Date</span>
                            <span>#</span>
                            <span>Actions</span>
                        </div>
                        {hiddenArticles.map((article) => (
                            <ArticleRow key={article.id} article={article} isHidden={true} />
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
                                <span className="col-order"></span>
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
        
        .section-title-hidden {
          color: #b91c1c;
        }
        
        .articles-table {
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          overflow: hidden;
        }
        
        .articles-table-hidden {
          opacity: 0.7;
          border-color: #fecaca;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 1fr 70px 40px 90px;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-4);
          background-color: var(--color-bg-alt);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 1fr 70px 40px 90px;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
          align-items: center;
        }
        
        .row-hidden {
          background-color: #fef2f2;
        }
        
        .col-title {
          min-width: 0;
        }
        
        .title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .article-title-link {
          font-weight: 500;
          font-size: 14px;
          color: var(--color-text);
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .article-title-link:hover {
          color: var(--color-accent);
        }
        
        .context-label {
          font-size: 11px;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }
        
        .col-date {
          font-size: 12px;
          color: var(--color-text-muted);
        }
        
        .order-input {
          width: 36px;
          padding: 4px;
          border: 1px solid var(--color-border-subtle);
          border-radius: 4px;
          font-size: 12px;
          text-align: center;
        }
        
        .order-input:focus {
          border-color: var(--color-accent);
          outline: none;
        }
        
        .featured-badge {
          color: #d4a000;
          font-size: 14px;
        }
        
        .col-actions {
          display: flex;
          gap: 4px;
        }
        
        .action-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-border-subtle);
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          text-decoration: none;
          color: inherit;
        }
        
        .action-btn:hover {
          background: var(--color-bg-alt);
          border-color: var(--color-text-muted);
        }
        
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .action-hide:hover {
          background: #fef2f2;
          border-color: #dc2626;
        }
        
        .action-show:hover {
          background: #f0fdf4;
          border-color: #16a34a;
        }
        
        .empty-state {
          padding: var(--space-16) 0;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
