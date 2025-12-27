'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function formatDuration(seconds) {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
        return `${mins}m ${secs}s`
    }
    return `${secs}s`
}

export default function AdminAnalyticsContent({ initialData }) {
    const [days, setDays] = useState(7)
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (days === initialData?.days) {
            setData(initialData)
            return
        }

        async function fetchData() {
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/analytics?days=${days}`)
                if (res.ok) {
                    const newData = await res.json()
                    setData(newData)
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [days, initialData])

    const maxDailyViews = Math.max(...(data?.dailyViews?.map(d => d.count) || [1]), 1)

    return (
        <div className="admin-analytics">
            <header className="admin-header">
                <h1 className="admin-title">Analytics</h1>
                <div className="date-range-selector">
                    <button
                        className={`range-btn ${days === 7 ? 'active' : ''}`}
                        onClick={() => setDays(7)}
                    >
                        Last 7 Days
                    </button>
                    <button
                        className={`range-btn ${days === 30 ? 'active' : ''}`}
                        onClick={() => setDays(30)}
                    >
                        Last 30 Days
                    </button>
                </div>
            </header>

            {loading && <div className="loading-overlay">Loading...</div>}

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-number">{data?.totalViews || 0}</span>
                    <span className="stat-label">Total Views</span>
                </div>

                <div className="stat-card">
                    <span className="stat-number">{data?.uniqueSessions || 0}</span>
                    <span className="stat-label">Unique Visitors</span>
                </div>

                <div className="stat-card">
                    <span className="stat-number">{formatDuration(data?.avgDuration)}</span>
                    <span className="stat-label">Avg. Time on Page</span>
                </div>
            </div>

            {/* Daily Views Chart */}
            <section className="analytics-section">
                <h2 className="section-title">Views Over Time</h2>
                <div className="chart-container">
                    <div className="bar-chart">
                        {data?.dailyViews?.map((day, index) => (
                            <div key={day.date} className="bar-wrapper">
                                <div
                                    className="bar"
                                    style={{ height: `${(day.count / maxDailyViews) * 100}%` }}
                                    title={`${day.count} views`}
                                >
                                    <span className="bar-value">{day.count > 0 ? day.count : ''}</span>
                                </div>
                                <span className="bar-label">
                                    {new Date(day.date).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Articles */}
            <section className="analytics-section">
                <h2 className="section-title">Top Articles</h2>
                {data?.topArticles?.length > 0 ? (
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th className="text-right">Views</th>
                                <th className="text-right">Avg. Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topArticles.map((article, index) => (
                                <tr key={article.id}>
                                    <td>
                                        <Link href={`/articles/${article.slug}`} className="article-link">
                                            {article.title}
                                        </Link>
                                    </td>
                                    <td className="text-right">{article.views}</td>
                                    <td className="text-right text-muted">
                                        {formatDuration(article.avgDuration)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-muted">No article views recorded yet.</p>
                )}
            </section>

            <style jsx>{`
        .admin-analytics {
          position: relative;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-8);
        }

        .date-range-selector {
          display: flex;
          gap: var(--space-2);
          background-color: var(--color-bg-alt);
          padding: var(--space-1);
          border-radius: 6px;
        }

        .range-btn {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-text-muted);
          background: none;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .range-btn:hover {
          color: var(--color-text);
        }

        .range-btn.active {
          background-color: var(--color-bg-elevated);
          color: var(--color-text);
          box-shadow: var(--shadow-sm);
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          right: 0;
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

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
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
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

        .analytics-section {
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

        .chart-container {
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          padding: var(--space-6);
          overflow-x: auto;
        }

        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: var(--space-2);
          height: 200px;
          min-width: max-content;
        }

        .bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          min-width: 40px;
          flex: 1;
        }

        .bar {
          width: 100%;
          max-width: 48px;
          background: linear-gradient(180deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          position: relative;
          transition: height var(--transition-base);
        }

        .bar-value {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .bar-label {
          font-size: var(--text-xs);
          color: var(--color-text-subtle);
          white-space: nowrap;
        }

        .analytics-table {
          width: 100%;
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          border-collapse: collapse;
          overflow: hidden;
        }

        .analytics-table th,
        .analytics-table td {
          padding: var(--space-4);
          text-align: left;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .analytics-table th {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          background-color: var(--color-bg-alt);
        }

        .analytics-table tr:last-child td {
          border-bottom: none;
        }

        .analytics-table .article-link {
          color: var(--color-text);
          text-decoration: none;
          font-weight: 500;
        }

        .analytics-table .article-link:hover {
          color: var(--color-accent);
        }

        .text-right {
          text-align: right;
        }
      `}</style>
        </div>
    )
}
