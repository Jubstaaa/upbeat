import type { DayTone, Incident, Outage } from './status.types'

const MINUTE = 60
const HOUR = 3_600
const DAY = 86_400
const WARN_BELOW = 100
const DOWN_BELOW = 99

const dayFormat = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
})

const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: 'short',
    timeZone: 'UTC',
})

export function formatPercent(value: number | null): string {
    if (value === null) return '—'
    if (value >= 100) return '100%'
    const hundredths = Math.floor(Math.round(value * 1_000_000) / 10_000)
    return `${(hundredths / 100).toFixed(2)}%`
}

export function formatDuration(seconds: number): string {
    if (seconds < MINUTE) return 'less than a minute'
    const days = Math.floor(seconds / DAY)
    const hours = Math.floor((seconds % DAY) / HOUR)
    const minutes = Math.floor((seconds % HOUR) / MINUTE)
    const parts: string[] = []
    if (days) parts.push(`${days}d`)
    if (hours) parts.push(`${hours}h`)
    if (minutes && !days) parts.push(`${minutes}m`)
    return parts.join(' ')
}

export function formatAgo(seconds: number): string {
    if (seconds < MINUTE) return 'just now'
    if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} min ago`
    if (seconds < DAY) return `${Math.floor(seconds / HOUR)} h ago`
    return `${Math.floor(seconds / DAY)} d ago`
}

export function formatDay(seconds: number): string {
    return dayFormat.format(seconds * 1_000)
}

export function formatDateTime(seconds: number): string {
    return `${dateTimeFormat.format(seconds * 1_000)} UTC`
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
