'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminArticleEditContent({ article }) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    const [formData, setFormData] = useState({
        title: article.title || '',
        standfirst: article.standfirst || '',
        content: article.content || '',
        contextLabel: article.contextLabel || '',
        byline: article.byline || '',
        imageUrl: article.imageUrl || '',
        featured: article.featured || false,
        sportFilter: article.sportFilter || '',
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')

        try {
            const res = await fetch(`/api/admin/articles/${article.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setMessage('Article saved successfully!')
                router.refresh()
            } else {
                const data = await res.json()
                setMessage(data.error || 'Failed to save article')
            }
        } catch (error) {
            setMessage('Failed to save article')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="admin-article-edit">
            <header className="admin-header">
                <div className="header-content">
                    <Link href="/admin/articles" className="back-link">← Back to Articles</Link>
                    <h1 className="admin-title">Edit Article</h1>
                </div>
                <div className="header-actions">
                    <Link href={`/articles/${article.slug}`} target="_blank" className="btn btn-secondary">
                        View Live
                    </Link>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="article-form">
                <div className="form-grid">
                    <div className="form-main">
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Standfirst</label>
                            <textarea
                                name="standfirst"
                                value={formData.standfirst}
                                onChange={handleChange}
                                className="form-textarea"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Content (HTML)</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                className="form-textarea content-editor"
                                rows={20}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-sidebar">
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">Metadata</h3>

                            <div className="form-group">
                                <label className="form-label">Context Label</label>
                                <input
                                    type="text"
                                    name="contextLabel"
                                    value={formData.contextLabel}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g. Opinion, Analysis"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Byline</label>
                                <input
                                    type="text"
                                    name="byline"
                                    value={formData.byline}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sport Filter</label>
                                <select
                                    name="sportFilter"
                                    value={formData.sportFilter}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="">All</option>
                                    <option value="Cycling">Cycling</option>
                                    <option value="Running">Running</option>
                                    <option value="Multi">Multi</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Image URL</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleChange}
                                    />
                                    <span>Featured Article</span>
                                </label>
                            </div>
                        </div>

                        <div className="sidebar-card info-card">
                            <h3 className="sidebar-title">Info</h3>
                            <dl className="info-list">
                                <dt>Slug</dt>
                                <dd>{article.slug}</dd>
                                <dt>Published</dt>
                                <dd>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-GB') : 'Not published'}</dd>
                                <dt>Reading Time</dt>
                                <dd>{article.readingTime} min</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    {message && <span className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</span>}
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-8);
                }

                .back-link {
                    font-size: var(--text-sm);
                    color: var(--color-text-muted);
                    text-decoration: none;
                    margin-bottom: var(--space-2);
                    display: block;
                }

                .back-link:hover {
                    color: var(--color-accent);
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: var(--space-8);
                }

                .form-main {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-5);
                }

                .form-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                .sidebar-card {
                    background-color: var(--color-bg-elevated);
                    border: 1px solid var(--color-border-subtle);
                    border-radius: 6px;
                    padding: var(--space-5);
                }

                .sidebar-title {
                    font-family: var(--font-sans);
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: var(--color-text);
                    margin-bottom: var(--space-4);
                }

                .content-editor {
                    font-family: 'SF Mono', Monaco, 'Consolas', monospace;
                    font-size: var(--text-sm);
                    line-height: var(--leading-relaxed);
                }

                .checkbox-group {
                    margin-top: var(--space-4);
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    cursor: pointer;
                    font-size: var(--text-sm);
                }

                .info-list {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: var(--space-2) var(--space-4);
                    font-size: var(--text-sm);
                }

                .info-list dt {
                    color: var(--color-text-muted);
                }

                .info-list dd {
                    color: var(--color-text);
                    margin: 0;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: var(--space-4);
                    margin-top: var(--space-8);
                    padding-top: var(--space-6);
                    border-top: 1px solid var(--color-border-subtle);
                }

                .message {
                    font-size: var(--text-sm);
                }

                .message.success {
                    color: #065F46;
                }

                .message.error {
                    color: #991B1B;
                }

                @media (max-width: 900px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}
