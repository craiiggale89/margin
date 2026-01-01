'use client'

import { useEffect } from 'react'

export default function AdminError({ error, reset }) {
    useEffect(() => {
        console.error('[Admin Error]', error)
    }, [error])

    const isConnectionError = error.message?.includes('MaxClientsInSessionMode') ||
        error.message?.includes('Error querying the database')

    return (
        <div className="error-container">
            <h2>Database Connection Issue</h2>
            {isConnectionError ? (
                <p className="error-description">
                    The database is temporarily overloaded (likely from AI processing).
                    This is a connection limit issue, <strong>not</strong> data loss.
                </p>
            ) : (
                <p className="error-description">
                    Something went wrong loading this page.
                </p>
            )}

            <div className="error-details">
                <code>{error.message || 'Unknown error'}</code>
            </div>

            <div className="error-actions">
                <button onClick={() => reset()} className="btn-primary">
                    Try Again
                </button>
                <a href="/admin" className="btn-secondary">
                    Back to Dashboard
                </a>
            </div>

            <style jsx>{`
        .error-container {
          max-width: 600px;
          margin: 60px auto;
          padding: 40px;
          text-align: center;
        }
        h2 {
          font-family: var(--font-serif);
          font-size: 28px;
          margin-bottom: 16px;
        }
        .error-description {
          color: var(--color-text-secondary);
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .error-details {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: left;
          overflow-x: auto;
        }
        .error-details code {
          font-family: var(--font-mono);
          font-size: 12px;
          color: #c62828;
          word-break: break-word;
        }
        .error-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .btn-primary {
          background: #1a1a1a;
          color: white;
          padding: 10px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-primary:hover {
          background: #333;
        }
        .btn-secondary {
          background: transparent;
          color: #1a1a1a;
          padding: 10px 24px;
          border: 1px solid #ccc;
          border-radius: 4px;
          text-decoration: none;
          font-size: 14px;
        }
        .btn-secondary:hover {
          border-color: #999;
        }
      `}</style>
        </div>
    )
}
