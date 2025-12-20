'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PitchActions({ pitchId }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const [notes, setNotes] = useState('')

    const handleAction = async (action) => {
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/pitches/${pitchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, notes: notes || undefined }),
            })

            if (res.ok) {
                router.refresh()
                setShowNotes(false)
                setNotes('')
            }
        } catch (error) {
            console.error('Action failed:', error)
        } finally {
            setLoading(false)
        }
    }

    if (showNotes) {
        return (
            <div className="pitch-card-actions">
                <div className="notes-form">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes for the revision request..."
                        className="form-textarea notes-textarea"
                    />
                    <div className="notes-actions">
                        <button
                            onClick={() => handleAction('revision')}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            Send Revision Request
                        </button>
                        <button
                            onClick={() => setShowNotes(false)}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <style jsx>{`
          .notes-form {
            width: 100%;
          }
          
          .notes-textarea {
            min-height: 80px;
            margin-bottom: var(--space-3);
          }
          
          .notes-actions {
            display: flex;
            gap: var(--space-2);
          }
        `}</style>
            </div>
        )
    }

    return (
        <div className="pitch-card-actions">
            <button
                onClick={() => handleAction('approve')}
                className="btn btn-primary"
                disabled={loading}
            >
                Approve
            </button>
            <button
                onClick={() => setShowNotes(true)}
                className="btn btn-secondary"
                disabled={loading}
            >
                Request Revision
            </button>
            <button
                onClick={() => handleAction('reject')}
                className="btn btn-ghost"
                disabled={loading}
            >
                Reject
            </button>
        </div>
    )
}
