'use client'

import { useState, useEffect } from 'react'

export default function CronSettings() {
    const [settings, setSettings] = useState({ cronEnabled: true, maxPitchesPerAgent: 1 })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to fetch settings:', err)
                setLoading(false)
            })
    }, [])

    const handleUpdate = async () => {
        setSaving(true)
        setMessage('Saving...')
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            if (res.ok) {
                setMessage('Settings updated!')
                setTimeout(() => setMessage(''), 2000)
            } else {
                setMessage('Failed to update.')
            }
        } catch (error) {
            console.error(error)
            setMessage('Error updating settings.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="cron-settings-loading text-xs">Loading settings...</div>

    return (
        <div className="cron-settings">
            <h2 className="section-title">Automated Pitching</h2>
            <div className="settings-card">
                <div className="settings-row">
                    <div className="settings-info">
                        <span className="settings-label">Enable Cron Job</span>
                        <span className="settings-desc">Turn on automatic pitch generation twice daily.</span>
                    </div>
                    <button
                        onClick={() => setSettings(s => ({ ...s, cronEnabled: !s.cronEnabled }))}
                        className={`toggle-btn ${settings.cronEnabled ? 'active' : ''}`}
                    >
                        <div className="toggle-thumb" />
                    </button>
                </div>

                <div className="settings-row">
                    <div className="settings-info">
                        <span className="settings-label">Pitches per Agent</span>
                        <span className="settings-desc">Number of pitches each active agent generates per run.</span>
                    </div>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={settings.maxPitchesPerAgent}
                        onChange={(e) => setSettings(s => ({ ...s, maxPitchesPerAgent: parseInt(e.target.value) }))}
                        className="settings-input"
                    />
                </div>

                <div className="settings-footer">
                    <span className="settings-status">{message}</span>
                    <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="btn btn-primary btn-sm"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            <style jsx>{`
        .cron-settings {
          margin-bottom: var(--space-10);
        }
        .settings-card {
          background-color: var(--color-bg-elevated);
          padding: var(--space-5);
          border-radius: 6px;
          border: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }
        .settings-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .settings-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .settings-label {
          font-weight: 500;
          font-size: var(--text-sm);
        }
        .settings-desc {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }
        .settings-input {
          width: 60px;
          padding: var(--space-2);
          background-color: var(--color-bg-alt);
          border: 1px solid var(--color-border-subtle);
          border-radius: 4px;
          color: var(--color-text);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
        }
        .toggle-btn {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background-color: var(--color-bg-alt);
          border: 1px solid var(--color-border-subtle);
          position: relative;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        .toggle-btn.active {
          background-color: var(--color-accent);
          border-color: var(--color-accent);
        }
        .toggle-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: white;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: left var(--transition-fast);
        }
        .toggle-btn.active .toggle-thumb {
          left: 22px;
        }
        .settings-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-2);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
        }
        .settings-status {
          font-size: var(--text-xs);
          color: var(--color-accent);
        }
      `}</style>
        </div>
    )
}
