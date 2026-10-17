import type { BadgeContent } from './badge.types'
import { formatPercent } from './format'
import { OVERALL_COLORS, UNKNOWN_COLOR } from './overall'
import type { MonitorState, StatusResult } from './status.types'
import { escapeXml } from './xml'

const CHARACTER_WIDTH = 6.5
const PADDING = 10

const MONITOR_COLORS: Record<MonitorState, string> = {
    down: OVERALL_COLORS.outage,
    paused: UNKNOWN_COLOR,
    pending: UNKNOWN_COLOR,
    up: OVERALL_COLORS.operational,
}

const UNKNOWN: BadgeContent = {
    color: UNKNOWN_COLOR,
    label: 'status',
    message: 'unknown',
}

export function getBadgeContent(
    result: StatusResult,
    monitorId: string | null
): BadgeContent {
    if (result.kind !== 'ok') return UNKNOWN
    const { data } = result
    if (!monitorId)
        return {
            color: OVERALL_COLORS[data.overall],
            label: 'status',
            message: data.overall,
        }
    const monitor = data.groups
        .flatMap(group => group.monitors)
        .find(entry => entry.id === monitorId)
    if (!monitor) return UNKNOWN
    return {
        color: MONITOR_COLORS[monitor.state],
        label: monitor.name,
        message:
            monitor.state === 'up'
                ? `up ${formatPercent(monitor.uptime)}`
                : monitor.state,
    }
}

function textWidth(text: string): number {
    return Math.round(text.length * CHARACTER_WIDTH + PADDING * 2)
}

export function renderBadge({ color, label, message }: BadgeContent): string {
    const labelWidth = textWidth(label)
    const messageWidth = textWidth(message)
    const width = labelWidth + messageWidth
    const safeLabel = escapeXml(label)
    const safeMessage = escapeXml(message)
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${safeLabel}: ${safeMessage}">`,
        `<title>${safeLabel}: ${safeMessage}</title>`,
        '<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>',
        `<clipPath id="r"><rect width="${width}" height="20" rx="3" fill="#fff"/></clipPath>`,
        `<g clip-path="url(#r)"><rect width="${labelWidth}" height="20" fill="#555"/><rect x="${labelWidth}" width="${messageWidth}" height="20" fill="${color}"/><rect width="${width}" height="20" fill="url(#s)"/></g>`,
        '<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">',
        `<text x="${labelWidth / 2}" y="14">${safeLabel}</text>`,
        `<text x="${labelWidth + messageWidth / 2}" y="14">${safeMessage}</text>`,
        '</g></svg>',
    ].join('')
}
