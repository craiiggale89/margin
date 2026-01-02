'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminSeoContent({ articles }) {
    const router = useRouter()
    const [expandedId, setExpandedId] = useState(null)
    const [saving, setSaving] = useState(null)
    const [auditing, setAuditing] = useState(null)

    const getStatus = (article) => {
        if (article.seoStatus) return article.seoStatus
        // Auto-determine based on fields
        const issues = []
        if (!article.metaDescription) issues.push('No meta description')
        if (article.title.length > 60) issues.push('Title too long')
        if (article.internalLinksOut === 0) issues.push('No internal links')
        return issues.length > 0 ? 'NEEDS_ATTENTION' : 'OK'
    }

    const handleSave = async (articleId, data) => {
        setSaving(articleId)
        try {
            await fetch(`/api/admin/seo/${articleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            router.refresh()
        } finally {
            setSaving(null)
        }
    }

    const handleAudit = async (articleId) => {
        setAuditing(articleId)
        try {
            const res = await fetch(`/api/admin/seo/audit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId }),
            })
            if (res.ok) {
                router.refresh()
            }
        } finally {
            setAuditing(null)
        }
    }

    return (
        <div className="seo-page">
            <header className="admin-header">
                <h1 className="admin-title">SEO</h1>
                <p className="text-muted">Editorial hygiene, not optimisation</p>
            </header>

            {/* Article Health Overview */}
            <section className="seo-section">
                <h2 className="section-title">Article Health</h2>
                <div className="seo-table">
                    <div className="table-header">
                        <span>Article</span>
                        <span>Title</span>
                        <span>Meta</span>
                        <span>Links</span>
                        <span>Index</span>
                        <span>Status</span>
                    </div>
                    {articles.map((article) => {
                        const status = getStatus(article)
                        const isExpanded = expandedId === article.id

                        return (
                            <div key={article.id}>
                                <div
                                    className={`table-row ${isExpanded ? 'expanded' : ''}`}
                                    onClick={() => setExpandedId(isExpanded ? null : article.id)}
                                >
                                    <div className="col-title">
                                        <span className="article-name">{article.title}</span>
                                        {article.contextLabel && (
                                            <span className="context-label">{article.contextLabel}</span>
                                        )}
                                    </div>
                                    <span className="col-metric">
                                        {article.title.length}
                                        {article.title.length > 60 && <span className="warn">!</span>}
                                    </span>
                                    <span className="col-metric">
                                        {article.metaDescription ? '✓' : '—'}
                                    </span>
                                    <span className="col-metric">
                                        ↓{article.internalLinksIn} ↑{article.internalLinksOut}
                                    </span>
                                    <span className="col-metric">
                                        {article.noindex ? 'No' : 'Yes'}
                                    </span>
                                    <span className={`status status-${status.toLowerCase().replace('_', '-')}`}>
                                        {status === 'OK' ? 'OK' : 'Needs attention'}
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div className="expanded-panel">
                                        <div className="panel-grid">
                                            <div className="panel-section">
                                                <h4>Canonical & Indexing</h4>
                                                <div className="field">
                                                    <label>Public URL</label>
                                                    <Link href={`/articles/${article.slug}`} target="_blank" className="url-link">
                                                        /articles/{article.slug}
                                                    </Link>
                                                </div>
                                                <div className="field">
                                                    <label>Canonical URL</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={article.canonicalUrl || ''}
                                                        placeholder="Leave blank for default"
                                                        onBlur={(e) => handleSave(article.id, { canonicalUrl: e.target.value || null })}
                                                    />
                                                </div>
                                                <div className="field">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            defaultChecked={article.noindex}
                                                            onChange={(e) => handleSave(article.id, { noindex: e.target.checked })}
                                                        />
                                                        Noindex (hide from search)
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="panel-section">
                                                <h4>Meta Description</h4>
                                                <textarea
                                                    defaultValue={article.metaDescription || ''}
                                                    placeholder="One calm, factual sentence describing what the article examines..."
                                                    rows={3}
                                                    onBlur={(e) => handleSave(article.id, { metaDescription: e.target.value || null })}
                                                />
                                                <p className="hint">Keep it under 160 characters. No calls to action.</p>
                                            </div>

                                            <div className="panel-section">
                                                <h4>SEO Steward</h4>
                                                {article.seoNotes && (
                                                    <div className="steward-notes">
                                                        <p>{article.seoNotes}</p>
                                                        {article.seoLastReviewedAt && (
                                                            <span className="reviewed-date">
                                                                Reviewed {new Date(article.seoLastReviewedAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={(e) => { e.stopPropagation(); handleAudit(article.id) }}
                                                    disabled={auditing === article.id}
                                                >
                                                    {auditing === article.id ? 'Auditing...' : 'Run Audit'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Internal Links */}
                                        <div className="panel-section full-width">
                                            <h4>Internal Links</h4>
                                            <div className="links-grid">
                                                <div>
                                                    <strong>Links to this article:</strong>
                                                    {article.relatedFrom?.length > 0 ? (
                                                        <ul>
                                                            {article.relatedFrom.map(r => (
                                                                <li key={r.from.id}>{r.from.title}</li>
                                                            ))}
                                                        </ul>
                                                    ) : <p className="text-muted">None</p>}
                                                </div>
                                                <div>
                                                    <strong>Links from this article:</strong>
                                                    {article.relatedTo?.length > 0 ? (
                                                        <ul>
                                                            {article.relatedTo.map(r => (
                                                                <li key={r.to.id}>{r.to.title}</li>
                                                            ))}
                                                        </ul>
                                                    ) : <p className="text-muted">None</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>

            <style jsx>{`
                .seo-page {
                    max-width: 1200px;
                }
                
                .seo-section {
                    margin-bottom: var(--space-10);
                }
                
                .section-title {
                    font-family: var(--font-sans);
                    font-size: var(--text-sm);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-text-muted);
                    margin-bottom: var(--space-4);
                }
                
                .seo-table {
                    background: var(--color-bg-elevated);
                    border: 1px solid var(--color-border-subtle);
                    border-radius: 6px;
                    overflow: hidden;
                }
                
                .table-header {
                    display: grid;
                    grid-template-columns: 1fr 60px 50px 80px 50px 100px;
                    gap: var(--space-3);
                    padding: var(--space-2) var(--space-4);
                    background: var(--color-bg-alt);
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--color-text-muted);
                }
                
                .table-row {
                    display: grid;
                    grid-template-columns: 1fr 60px 50px 80px 50px 100px;
                    gap: var(--space-3);
                    padding: var(--space-3) var(--space-4);
                    border-top: 1px solid var(--color-border-subtle);
                    cursor: pointer;
                    transition: background 0.1s;
                }
                
                .table-row:hover {
                    background: var(--color-bg-alt);
                }
                
                .table-row.expanded {
                    background: var(--color-bg-alt);
                    border-bottom: none;
                }
                
                .col-title {
                    min-width: 0;
                }
                
                .article-name {
                    font-weight: 500;
                    font-size: 14px;
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .context-label {
                    font-size: 11px;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                }
                
                .col-metric {
                    font-size: 13px;
                    color: var(--color-text-secondary);
                }
                
                .warn {
                    color: #dc2626;
                    margin-left: 4px;
                }
                
                .status {
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .status-ok {
                    color: #16a34a;
                }
                
                .status-needs-attention {
                    color: #d97706;
                }
                
                .expanded-panel {
                    padding: var(--space-4);
                    background: #fafafa;
                    border-top: 1px solid var(--color-border-subtle);
                }
                
                .panel-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-6);
                    margin-bottom: var(--space-6);
                }
                
                .panel-section h4 {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--color-text-muted);
                    margin-bottom: var(--space-3);
                }
                
                .panel-section.full-width {
                    grid-column: 1 / -1;
                }
                
                .field {
                    margin-bottom: var(--space-3);
                }
                
                .field label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: var(--space-1);
                }
                
                .field input[type="text"],
                .panel-section textarea {
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid var(--color-border-subtle);
                    border-radius: 4px;
                    font-size: 13px;
                }
                
                .field input[type="checkbox"] {
                    margin-right: 8px;
                }
                
                .url-link {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--color-accent);
                }
                
                .hint {
                    font-size: 11px;
                    color: var(--color-text-muted);
                    margin-top: var(--space-1);
                }
                
                .steward-notes {
                    background: white;
                    padding: var(--space-3);
                    border: 1px solid var(--color-border-subtle);
                    border-radius: 4px;
                    margin-bottom: var(--space-3);
                    font-size: 13px;
                }
                
                .reviewed-date {
                    display: block;
                    font-size: 11px;
                    color: var(--color-text-muted);
                    margin-top: var(--space-2);
                }
                
                .links-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-6);
                }
                
                .links-grid ul {
                    margin: var(--space-2) 0;
                    padding-left: var(--space-4);
                }
                
                .links-grid li {
                    font-size: 13px;
                    margin-bottom: var(--space-1);
                }
                
                .btn {
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-size: 13px;
                    cursor: pointer;
                }
                
                .btn-outline {
                    background: white;
                    border: 1px solid var(--color-border-subtle);
                }
                
                .btn-outline:hover {
                    border-color: var(--color-text-muted);
                }
                
                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    )
}
