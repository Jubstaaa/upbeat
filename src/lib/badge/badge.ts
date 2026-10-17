import { makeBadge } from 'badge-maker'

import { formatPercent } from '@/lib/format/format'
import { OVERALL_COLORS, UNKNOWN_COLOR } from '@/lib/overall/overall'
import type { MonitorState, StatusResult } from '@/lib/status/status.types'

import type { BadgeContent } from './badge.types'

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

export function renderBadge(content: BadgeContent): string {
    return makeBadge({ ...content, style: 'flat' })
}
