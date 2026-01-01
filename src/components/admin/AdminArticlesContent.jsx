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
                <Link href={`/articles/${article.slug}`} target="_blank" className="article-title-link">
                    {article.title}
                </Link>
                {article.contextLabel && (
                    <span className="context-label">{article.contextLabel}</span>
                )}
            </div>
            <span className="col-date text-muted">
                {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                })}
            </span>
            <span className="col-order">
                <input
                    type="number"
                    className="order-input"
                    defaultValue={article.displayOrder || 0}
                    onBlur={(e) => handleOrderChange(article.id, e.target.value)}
                    disabled={orderingId === article.id}
                    title="Lower = appears first (1, 2, 3...)"
                    min="0"
                />
            </span>
            <span className="col-featured">
                {article.featured && <span className="featured-badge">★</span>}
            </span>
            <div className="col-actions">
                <button
                    onClick={() => handleToggleVisibility(article.id, isHidden)}
                    disabled={togglingId === article.id}
                    className={`btn btn-sm ${isHidden ? 'btn-outline' : 'btn-danger-outline'}`}
                >
                    {togglingId === article.id ? '...' : isHidden ? 'Show' : 'Hide'}
                </button>
                {upgradedIds.has(article.id) ? (
                    <Link href={`/admin/drafts/${upgradedIds.get(article.id)}`} className="btn btn-success btn-sm">
                        View Draft
                    </Link>
                ) : (
                    <button
                        onClick={() => handleUpgrade(article.id)}
                        disabled={upgradingId === article.id}
                        className="btn btn-outline btn-sm"
                    >
                        {upgradingId === article.id ? '...' : 'Upgrade'}
                    </button>
                )}
                <Link href={`/admin/articles/${article.id}`} className="btn btn-ghost btn-sm">
                    Edit
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
                            <span className="col-title">Title</span>
                            <span className="col-date">Published</span>
                            <span className="col-order">Order</span>
                            <span className="col-featured">Featured</span>
                            <span className="col-actions">Actions</span>
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
                            <span className="col-title">Title</span>
                            <span className="col-date">Published</span>
                            <span className="col-order">Order</span>
                            <span className="col-featured">Featured</span>
                            <span className="col-actions">Actions</span>
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
          grid-template-columns: 1fr 100px 60px 70px 180px;
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
          grid-template-columns: 1fr 100px 60px 70px 180px;
          gap: var(--space-4);
          padding: var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
          align-items: center;
        }
        
        .row-hidden {
          background-color: #fef2f2;
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
        
        .order-input {
          width: 50px;
          padding: 4px 6px;
          border: 1px solid var(--color-border-subtle);
          border-radius: 4px;
          font-size: var(--text-sm);
          text-align: center;
        }
        
        .order-input:focus {
          border-color: var(--color-accent);
          outline: none;
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
        
        .btn-danger-outline {
          border-color: #dc2626;
          color: #dc2626;
        }
        
        .btn-danger-outline:hover {
          background-color: #fef2f2;
        }
        
        .empty-state {
          padding: var(--space-16) 0;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
