import type { StatusData } from '@/lib/status.types'

export async function fetchStatus(): Promise<StatusData> {
    const response = await fetch('/api/status', { cache: 'no-store' })
    if (!response.ok)
        throw new Error(`Status request failed with HTTP ${response.status}`)
    return (await response.json()) as StatusData
}

export function parseHash(raw: string): string {
    try {
        return decodeURIComponent(raw.replace(/^#/, ''))
    } catch {
        return ''
    }
}
