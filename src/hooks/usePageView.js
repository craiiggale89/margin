'use client'

import { useEffect, useRef } from 'react'

// Generate or retrieve a session ID for anonymous tracking
function getSessionId() {
    if (typeof window === 'undefined') return null

    let sessionId = localStorage.getItem('margin_session_id')
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
        localStorage.setItem('margin_session_id', sessionId)
    }
    return sessionId
}

export function usePageView(articleId) {
    const startTime = useRef(Date.now())
    const hasSentRef = useRef(false)

    useEffect(() => {
        if (!articleId) return

        const sessionId = getSessionId()
        startTime.current = Date.now()
        hasSentRef.current = false

        const sendPageView = () => {
            if (hasSentRef.current) return
            hasSentRef.current = true

            const duration = Math.round((Date.now() - startTime.current) / 1000)

            // Use sendBeacon for reliable delivery on page unload
            const data = JSON.stringify({ articleId, sessionId, duration })

            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/analytics/track', new Blob([data], { type: 'application/json' }))
            } else {
                // Fallback for browsers without sendBeacon
                fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: data,
                    keepalive: true
                }).catch(() => { })
            }
        }

        // Track on visibility change (tab switch/close)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                sendPageView()
            }
        }

        // Track on page unload
        const handleBeforeUnload = () => {
            sendPageView()
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
            // Send on component unmount (navigation within SPA)
            sendPageView()
        }
    }, [articleId])
}

export default usePageView
