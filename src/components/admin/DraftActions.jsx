'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DraftActions({ draftId, status, hasArticle, draftData = {} }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPublish, setShowPublish] = useState(false)
    const [reviewResult, setReviewResult] = useState(null)
    const [reviewLoading, setReviewLoading] = useState(false)

    const handleAction = async (action, data = {}) => {
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/drafts/${draftId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...data }),
            })

            if (res.ok) {
                router.refresh()
                if (action === 'publish') {
                    setShowPublish(false)
                }
            }
        } catch (error) {
            console.error('Action failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleQualityReview = async () => {
        setReviewLoading(true)
        setReviewResult(null)

        try {
            const res = await fetch(`/api/admin/drafts/${draftId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'review' }),
            })

            if (res.ok) {
                const data = await res.json()
                setReviewResult(data.review)
            }
        } catch (error) {
            console.error('Quality review failed:', error)
        } finally {
            setReviewLoading(false)
        }
    }

    // Show publish form
    if (showPublish) {
        return (
            <PublishForm
                onPublish={(data) => handleAction('publish', data)}
                onCancel={() => setShowPublish(false)}
                loading={loading}
                initialData={draftData}
            />
        )
    }

    // Already published
    if (hasArticle) {
        return (
            <div className="draft-actions">
                <span className="published-badge">Published</span>
            </div>
        )
    }

    // Approved - show publish button
    if (status === 'APPROVED') {
        return (
            <div className="draft-actions">
                <button
                    onClick={() => setShowPublish(true)}
                    className="btn btn-primary"
                >
                    Publish Article
                </button>
                <button
                    onClick={() => handleAction('unapprove')}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    {loading ? 'Unapproving...' : 'Unapprove'}
                </button>
            </div>
        )
    }

    // Submitted - show review actions
    if (status === 'SUBMITTED' || status === 'IN_REVIEW' || status === 'DRAFT' || status === 'REVISION_REQUESTED') {
        return (
            <>
                <div className="draft-actions">
                    <button
                        onClick={handleQualityReview}
                        className="btn btn-outline"
                        disabled={reviewLoading}
                    >
                        {reviewLoading ? 'Reviewing...' : 'Quality Review'}
                    </button>
                    <button
                        onClick={() => handleAction('approve')}
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {status === 'DRAFT' || status === 'REVISION_REQUESTED' ? 'Mark as Approved' : 'Approve'}
                    </button>
                    <button
                        onClick={() => handleAction('revision')}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Request Revision
                    </button>
                </div>

                {reviewResult && (
                    <ReviewResultPanel result={reviewResult} onDismiss={() => setReviewResult(null)} />
                )}
            </>
        )
    }

    return null
}

function ReviewResultPanel({ result, onDismiss }) {
    const verdictStyles = {
        READY: { bg: 'var(--color-success-bg)', border: 'var(--color-success)', icon: '✅' },
        REVISE: { bg: 'var(--color-warning-bg)', border: 'var(--color-warning)', icon: '⚠️' },
        REJECT: { bg: 'var(--color-error-bg)', border: 'var(--color-error)', icon: '❌' },
    }

    const style = verdictStyles[result.verdict] || verdictStyles.REVISE

    return (
        <div className="review-panel" style={{ backgroundColor: style.bg, borderColor: style.border }}>
            <div className="review-header">
                <span className="review-verdict">{style.icon} {result.verdict}</span>
                <button onClick={onDismiss} className="review-dismiss">✕</button>
            </div>

            {result.reasons && result.reasons.length > 0 && (
                <div className="review-section">
                    <h4>Reasons</h4>
                    <ul>
                        {result.reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            {result.verdict === 'REVISE' && result.requiredFixes && result.requiredFixes.length > 0 && (
                <div className="review-section">
                    <h4>Required Fixes</h4>
                    <ul>
                        {result.requiredFixes.map((fix, i) => (
                            <li key={i}>{fix}</li>
                        ))}
                    </ul>
                </div>
            )}

            <style jsx>{`
                .review-panel {
                    margin-top: var(--space-4);
                    padding: var(--space-4);
                    border: 1px solid;
                    border-radius: 6px;
                }
                
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-3);
                }
                
                .review-verdict {
                    font-weight: 600;
                    font-size: var(--text-lg);
                }
                
                .review-dismiss {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: var(--text-lg);
                    opacity: 0.6;
                }
                
                .review-dismiss:hover {
                    opacity: 1;
                }
                
                .review-section {
                    margin-top: var(--space-3);
                }
                
                .review-section h4 {
                    font-size: var(--text-sm);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: var(--tracking-wider);
                    color: var(--color-text-muted);
                    margin-bottom: var(--space-2);
                }
                
                .review-section ul {
                    margin: 0;
                    padding-left: var(--space-4);
                }
                
                .review-section li {
                    font-size: var(--text-sm);
                    margin-bottom: var(--space-1);
                }
            `}</style>
        </div>
    )
}

function PublishForm({ onPublish, onCancel, loading, initialData }) {
    const generateSlug = (text) => text.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const [slug, setSlug] = useState(initialData.title ? generateSlug(initialData.title) : '')
    const [contextLabel, setContextLabel] = useState(initialData.contextLabel || '')
    const [readingTime, setReadingTime] = useState(initialData.readingTime || '5')
    const [featured, setFeatured] = useState(false)
    const [sportFilter, setSportFilter] = useState(initialData.sportFilter || '')

    const handleSubmit = (e) => {
        e.preventDefault()
        onPublish({
            slug,
            contextLabel: contextLabel || undefined,
            readingTime: parseInt(readingTime) || 5,
            featured,
            sportFilter: sportFilter || undefined,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="publish-form card">
            <h3 className="publish-title">Publish Article</h3>

            <div className="form-group">
                <label htmlFor="slug" className="form-label">URL Slug *</label>
                <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="form-input"
                    placeholder="article-url-slug"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="readingTime" className="form-label">Reading Time (minutes) *</label>
                <input
                    id="readingTime"
                    type="number"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    className="form-input"
                    placeholder="5"
                    min="1"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="contextLabel" className="form-label">Context Label (optional)</label>
                <input
                    id="contextLabel"
                    type="text"
                    value={contextLabel}
                    onChange={(e) => setContextLabel(e.target.value)}
                    className="form-input"
                    placeholder="e.g., Performance, Racing, After"
                />
            </div>

            <div className="form-group">
                <label htmlFor="sportFilter" className="form-label">Sport Filter (optional)</label>
                <select
                    id="sportFilter"
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
                    className="form-select"
                >
                    <option value="">None</option>
                    <option value="Cycling">Cycling</option>
                    <option value="Running">Running</option>
                    <option value="Multi">Multi / Endurance</option>
                </select>
            </div>

            <div className="form-group checkbox-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                    />
                    <span>Feature on homepage</span>
                </label>
            </div>

            <div className="publish-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish Now'}
                </button>
                <button type="button" onClick={onCancel} className="btn btn-ghost">
                    Cancel
                </button>
            </div>

            <style jsx>{`
        .publish-form {
          min-width: 320px;
        }
        
        .publish-title {
          font-family: var(--font-sans);
          font-size: var(--text-lg);
          font-weight: 600;
          margin-bottom: var(--space-6);
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
        }
        
        .publish-actions {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-6);
        }
      `}</style>
        </form>
    )
}
