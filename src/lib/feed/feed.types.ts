import type { StatusData } from '@/lib/status/status.types'

export interface FeedInput {
    data: StatusData | null
    now: number
    siteUrl: string
    title: string
}

export interface FeedEntry {
    id: string
    summary: string
    title: string
    updated: string
}
