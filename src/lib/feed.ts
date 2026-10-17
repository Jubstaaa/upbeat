import type { FeedEntry, FeedInput } from './feed.types'
import { formatDateTime, formatDuration, formatIncidentTitle } from './format'
import { escapeXml } from './xml'

function toIso(seconds: number): string {
    return new Date(seconds * 1_000).toISOString()
}

function renderEntry(entry: FeedEntry, siteUrl: string): string {
    return [
        '<entry>',
        `<id>${escapeXml(entry.id)}</id>`,
        `<title>${escapeXml(entry.title)}</title>`,
        `<updated>${entry.updated}</updated>`,
        `<link href="${escapeXml(siteUrl)}/"/>`,
        `<summary>${escapeXml(entry.summary)}</summary>`,
        '</entry>',
    ].join('')
}

export function renderFeed({ data, now, siteUrl, title }: FeedInput): string {
    const incidents: FeedEntry[] = (data?.incidents ?? []).map(incident => ({
        id: `${siteUrl}/#incident-${incident.start}`,
        summary: `${incident.monitors.join(', ')}. Started ${formatDateTime(incident.start)}, ${
            incident.end === null
                ? 'still ongoing'
                : `lasted ${formatDuration(incident.end - incident.start)}`
        }.`,
        title: formatIncidentTitle(incident),
        updated: toIso(incident.end ?? incident.start),
    }))
    const windows: FeedEntry[] = (data?.maintenance ?? []).map(window => ({
        id: `${siteUrl}/#maintenance-${window.start}`,
        summary: `${formatDateTime(window.start)} to ${formatDateTime(window.end)}.`,
        title: `Scheduled maintenance: ${window.name}`,
        updated: toIso(window.start),
    }))
    const entries = [...incidents, ...windows].sort((a, b) =>
        b.updated.localeCompare(a.updated)
    )
    const safeTitle = escapeXml(title)
    const safeUrl = escapeXml(siteUrl)

    return [
        '<?xml version="1.0" encoding="utf-8"?>\n',
        '<feed xmlns="http://www.w3.org/2005/Atom">',
        `<id>${safeUrl}/</id>`,
        `<title>${safeTitle}</title>`,
        `<updated>${toIso(data?.updatedAt ?? now)}</updated>`,
        `<author><name>${safeTitle}</name></author>`,
        `<link href="${safeUrl}/"/>`,
        `<link rel="self" href="${safeUrl}/feed.xml"/>`,
        ...entries.map(entry => renderEntry(entry, siteUrl)),
        '</feed>',
    ].join('')
}
