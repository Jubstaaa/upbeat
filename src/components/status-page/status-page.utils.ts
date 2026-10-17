import type { StatusResponse } from '@/server/server.types'

export async function fetchStatus(): Promise<StatusResponse> {
    const response = await fetch('/api/status')
    if (response.status !== 200 && response.status !== 503)
        throw new Error(`Status request failed with HTTP ${response.status}`)
    return (await response.json()) as StatusResponse
}

export function parseHash(raw: string): string {
    try {
        return decodeURIComponent(raw.replace(/^#/, ''))
    } catch {
        return ''
    }
}
