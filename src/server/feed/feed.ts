import { Feed } from 'feed'

import type { StatusData } from '@/status/status.types'

import {
    formatDateTime,
    formatDuration,
    formatIncidentTitle,
} from '@/status/format'

interface FeedEntry {
    date: Date
    id: string
    summary: string
    title: string
}

interface FeedInput {
    data: null | StatusData
    now: number
    siteUrl: string
    title: string
}

export function renderFeed({ data, now, siteUrl, title }: FeedInput): string {
    const link = `${siteUrl}/`
    const incidents: FeedEntry[] = (data?.incidents ?? []).map(incident => ({
        date: toDate(incident.end ?? incident.start),
        id: `${siteUrl}/#incident-${incident.start}`,
        summary: `${incident.monitors.join(', ')}. Started ${formatDateTime(incident.start)}, ${
            incident.end === null
                ? 'still ongoing'
                : `lasted ${formatDuration(incident.end - incident.start)}`
        }.`,
        title: formatIncidentTitle(incident),
    }))
    const windows: FeedEntry[] = (data?.maintenance ?? []).map(window => ({
        date: toDate(window.start),
        id: `${siteUrl}/#maintenance-${window.start}`,
        summary: `${formatDateTime(window.start)} to ${formatDateTime(window.end)}.`,
        title: `Scheduled maintenance: ${window.name}`,
    }))

    const feed = new Feed({
        author: { name: title },
        copyright: '',
        feedLinks: { atom: `${siteUrl}/feed.xml` },
        id: link,
        link,
        title,
        updated: toDate(data?.updatedAt ?? now),
    })
    for (const entry of [...incidents, ...windows].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
    )) {
        feed.addItem({
            date: entry.date,
            description: entry.summary,
            id: entry.id,
            link,
            title: entry.title,
        })
    }
    return feed.atom1()
}

function toDate(seconds: number): Date {
    return new Date(seconds * 1_000)
}
