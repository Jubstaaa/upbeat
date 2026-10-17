'use client'

import { useCallback } from 'react'

import { useRouter } from 'next/navigation'

export default function ErrorScreen() {
    const router = useRouter()

    const handleRetry = useCallback(() => {
        router.refresh()
    }, [router])

    return (
        <main className="mx-auto max-w-xl px-4 py-16">
            <h1 className="text-2xl font-semibold tracking-tight">
                Status is unavailable
            </h1>
            <p className="mt-2 text-muted">
                We could not reach UptimeRobot just now. This is usually brief.
            </p>
            <button
                className="mt-6 rounded-lg border border-line bg-surface px-4 py-2 font-medium shadow-xs hover:bg-canvas"
                type="button"
                onClick={handleRetry}>
                Try again
            </button>
        </main>
    )
}
