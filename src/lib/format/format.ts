import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

import type { DayTone, Incident, Outage } from '@/lib/status/status.types'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(utc)

const MINUTE = 60
const WARN_BELOW = 100
const DOWN_BELOW = 99

export function formatPercent(value: number | null): string {
    if (value === null) return '—'
    if (value >= 100) return '100%'
    const hundredths = Math.floor(Math.round(value * 1_000_000) / 10_000)
    return `${(hundredths / 100).toFixed(2)}%`
}

export function formatDuration(seconds: number): string {
    if (seconds < MINUTE) return 'less than a minute'
    const span = dayjs.duration(seconds, 'seconds')
    const days = Math.floor(span.asDays())
    const parts: string[] = []
    if (days) parts.push(`${days}d`)
    if (span.hours()) parts.push(`${span.hours()}h`)
    if (span.minutes() && !days) parts.push(`${span.minutes()}m`)
    return parts.join(' ')
}

export function formatAgo(seconds: number): string {
    if (seconds < MINUTE) return 'just now'
    return `${dayjs.duration(seconds, 'seconds').humanize()} ago`
}

export function formatDay(seconds: number): string {
    return dayjs.unix(seconds).utc().format('MMM D')
}

export function formatDateTime(seconds: number): string {
    return dayjs.unix(seconds).utc().format('MMM D, HH:mm [UTC]')
}

export function formatOutageDuration({ end, start }: Outage): string {
    return end === null ? 'ongoing' : formatDuration(end - start)
}

export function formatIncidentTitle({
    end,
    monitors,
    ongoing,
}: Incident): string {
    const isOngoing = end === null
    const names = isOngoing ? ongoing : monitors
    if (names.length > 1)
        return `${names.length} services ${isOngoing ? 'are' : 'were'} down`
    return `${names[0]} ${isOngoing ? 'is' : 'was'} down`
}

export function dayTone(value: number | null): DayTone {
    if (value === null) return 'none'
    if (value >= WARN_BELOW) return 'up'
    if (value >= DOWN_BELOW) return 'warn'
    return 'down'
}
