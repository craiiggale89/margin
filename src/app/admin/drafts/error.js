'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="error-container">
            <h2>Something went wrong!</h2>
            <p className="error-message">{error.message || 'A database or server error occurred.'}</p>
            {error.message?.includes('MaxClientsInSessionMode') && (
                <div className="error-hint">
                    <p><strong>Hint:</strong> The database connection pool is full. This often happens during heavy AI processing. Please wait a moment and try refreshing.</p>
                </div>
            )}
            <button className="btn" onClick={() => reset()}>Try again</button>

            <style jsx>{`
        .error-container {
          padding: var(--space-20) var(--space-4);
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }
        h2 {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          margin-bottom: var(--space-4);
        }
        .error-message {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-8);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          background: var(--color-bg-alt);
          padding: var(--space-4);
          border-radius: 4px;
        }
        .error-hint {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #92400e;
          padding: var(--space-4);
          border-radius: 6px;
          margin-bottom: var(--space-8);
          text-align: left;
          font-size: var(--text-sm);
        }
        .btn {
          background-color: var(--color-text);
          color: white;
          padding: var(--space-2) var(--space-6);
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
        </div>
    )
}
