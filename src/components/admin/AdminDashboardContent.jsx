'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CronSettings from './CronSettings'

export default function AdminDashboardContent({ stats }) {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [selectedAgentIds, setSelectedAgentIds] = useState([])
  const [requesting, setRequesting] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  const handleCommission = async (e) => {
    e.preventDefault()
    if (!topic || selectedAgentIds.length === 0) return

    setRequesting(true)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < selectedAgentIds.length; i++) {
      const agentId = selectedAgentIds[i]
      setRequestMessage(`Commissioning ${i + 1} of ${selectedAgentIds.length}...`)

      try {
        const res = await fetch('/api/ai/generate-pitch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, topic })
        })

        if (res.ok) {
          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        console.error(`Failed for agent ${agentId}:`, error)
        failCount++
      }
    }

    if (successCount > 0) {
      setRequestMessage(`${successCount} Pitches Requested!`)
      setTopic('')
      setSelectedAgentIds([])
      setTimeout(() => {
        setRequesting(false)
        setRequestMessage('')
        router.refresh()
      }, 2000)
    } else {
      setRequestMessage('Failed to request.')
      setTimeout(() => setRequesting(false), 2000)
    }
  }

  const toggleAgent = (id) => {
    setSelectedAgentIds(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const selectAll = () => setSelectedAgentIds(stats.agents?.map(a => a.id) || [])
  const clearAll = () => setSelectedAgentIds([])

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

      {/* Commission Widget */}
      <section className="commission-widget">
        <h2 className="section-title">Commission Pitch</h2>
        <form onSubmit={handleCommission} className="commission-form-vertical">
          <div className="agent-selector-container">
            <div className="agent-selector-header">
              <span className="agent-selector-label">Select Agents ({selectedAgentIds.length} selected)</span>
              <div className="agent-selector-actions">
                <button type="button" onClick={selectAll} className="btn-text">Select All</button>
                <button type="button" onClick={clearAll} className="btn-text">Clear</button>
              </div>
            </div>
            <div className="agent-checkbox-grid">
              {stats.agents?.map(agent => (
                <label key={agent.id} className={`agent-checkbox-label ${selectedAgentIds.includes(agent.id) ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedAgentIds.includes(agent.id)}
                    onChange={() => toggleAgent(agent.id)}
                    className="agent-checkbox-input"
                  />
                  <div className="agent-checkbox-content">
                    <span className="agent-checkbox-name">{agent.name}</span>
                    {agent.focus && <span className="agent-checkbox-focus">{agent.focus}</span>}
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="topic-input-container">
            <div className="form-group flex-grow">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic (e.g. 'Doping in classic races')"
                className="form-input"
                required
              />
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={requesting || selectedAgentIds.length === 0}
              >
                {requesting ? requestMessage : `Commission ${selectedAgentIds.length > 0 ? selectedAgentIds.length : ''} Pitches`}
              </button>
            </div>
          </div>
        </form>

        {/* News Topics Helper */}
        {stats.newsTopics && Object.keys(stats.newsTopics).length > 0 && (
          <div className="news-topics-helper">
            <h3 className="news-helper-title">Recent Topics Agents are seeing:</h3>
            <div className="news-categories-grid">
              {Object.entries(stats.newsTopics).map(([category, headlines]) => (
                <div key={category} className="news-category">
                  <h4 className="news-category-name">{category}</h4>
                  <ul className="news-headline-list">
                    {headlines.map((headline, idx) => (
                      <li
                        key={idx}
                        className="news-headline-item"
                        onClick={() => setTopic(headline)}
                        title="Click to use topic"
                      >
                        {headline}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Cron Settings */}
      <CronSettings />

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

        .commission-widget {
          background-color: var(--color-bg-elevated);
          padding: var(--space-5);
          border-radius: 6px;
          border: 1px solid var(--color-border-subtle);
          margin-bottom: var(--space-10);
        }

        .commission-form-vertical {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .agent-selector-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .agent-selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .agent-selector-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .agent-selector-actions {
          display: flex;
          gap: var(--space-4);
        }

        .btn-text {
          background: none;
          border: none;
          padding: 0;
          font-size: var(--text-xs);
          color: var(--color-accent);
          cursor: pointer;
          font-weight: 500;
        }

        .btn-text:hover {
          text-decoration: underline;
        }

        .agent-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-3);
          max-height: 240px;
          overflow-y: auto;
          padding-right: var(--space-2);
        }

        .agent-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-3);
          background-color: var(--color-bg-alt);
          border: 1px solid var(--color-border-subtle);
          border-radius: 6px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .agent-checkbox-label:hover {
          background-color: var(--color-bg-elevated);
          border-color: var(--color-border);
        }

        .agent-checkbox-label.active {
          border-color: var(--color-accent);
          background-color: var(--color-accent-subtle);
        }

        .agent-checkbox-input {
          margin-top: 3px;
        }

        .agent-checkbox-content {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .agent-checkbox-name {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-text);
        }

        .agent-checkbox-focus {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          line-height: var(--leading-tight);
        }

        .topic-input-container {
          display: flex;
          gap: var(--space-3);
        }

        .btn-large {
          min-width: 200px;
        }

        .news-topics-helper {
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-border-subtle);
        }

        .news-helper-title {
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin-bottom: var(--space-4);
        }

        .news-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-6);
        }

        .news-category-name {
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: capitalize;
          margin-bottom: var(--space-2);
          color: var(--color-accent);
        }

        .news-headline-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .news-headline-item {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: var(--space-1) var(--space-2);
          border-radius: 4px;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
          line-height: var(--leading-tight);
        }

        .news-headline-item:hover {
          background-color: var(--color-bg-alt);
          color: var(--color-text);
          border-color: var(--color-border-subtle);
        }

        .form-group.flex-grow {
          flex-grow: 1;
          min-width: 200px;
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
