import slugifyText from '@sindresorhus/slugify'

import type {
    MonitorQuery,
    UptimeRobotMonitor,
} from '@/server/uptimerobot/uptimerobot.schema'
import type {
    Incident,
    MaintenanceWindow,
    MonitorGroup,
    MonitorState,
    MonitorStatus,
    Outage,
    OverallState,
    StatusData,
} from '@/status/status.types'

interface IncidentEntry {
    end: null | number
    monitor: string
    start: number
}

interface ParsedName {
    group: null | string
    name: string
}

export const HISTORY_DAYS = 90
export const DAY_SECONDS = 86_400

const INCIDENT_GAP_SECONDS = 60
const MAX_INCIDENTS = 10
const MAX_OUTAGES = 10
const DOWN_LOG = 1
const ONE_TIME_WINDOW = 1
const ACTIVE_WINDOW = 1
const GROUP_SEPARATOR = /\s+\/\s+/

const STATES: Record<number, MonitorState> = {
    0: 'paused',
    1: 'pending',
    2: 'up',
    8: 'down',
    9: 'down',
}

export function buildQuery(now: number): MonitorQuery {
    const dayStarts = getDayStarts(now)
    const ranges = dayStarts.map(start => `${start}_${start + DAY_SECONDS}`)
    ranges.push(`${dayStarts[0]}_${now}`)
    return {
        logsStart: dayStarts[0],
        now,
        ranges: ranges.join('-'),
        responseTimesStart: now - DAY_SECONDS,
    }
}

export function getDayStarts(now: number): [number, ...number[]] {
    const today = Math.floor(now / DAY_SECONDS) * DAY_SECONDS
    const [first, ...rest] = Array.from(
        { length: HISTORY_DAYS },
        (_, index) => today - (HISTORY_DAYS - 1 - index) * DAY_SECONDS
    )

    return [first ?? today, ...rest]
}

export function getOverall(
    monitors: MonitorStatus[],
    maintenance: MaintenanceWindow[],
    now: number
): OverallState {
    if (maintenance.some(window => window.start <= now && now < window.end))
        return 'maintenance'
    const watched = monitors.filter(monitor => monitor.state !== 'paused')
    const down = watched.filter(monitor => monitor.state === 'down').length
    if (down === 0) return 'operational'
    return down === watched.length ? 'outage' : 'degraded'
}

export function mergeIncidents(entries: IncidentEntry[]): Incident[] {
    const incidents: Incident[] = []
    for (const entry of [...entries].sort((a, b) => a.start - b.start)) {
        const last = incidents.at(-1)
        if (
            last &&
            (last.end === null ||
                entry.start <= last.end + INCIDENT_GAP_SECONDS)
        ) {
            last.end =
                last.end === null || entry.end === null
                    ? null
                    : Math.max(last.end, entry.end)
            if (!last.monitors.includes(entry.monitor))
                last.monitors.push(entry.monitor)
            if (entry.end === null) last.ongoing.push(entry.monitor)
        } else {
            incidents.push({
                end: entry.end,
                monitors: [entry.monitor],
                ongoing: entry.end === null ? [entry.monitor] : [],
                start: entry.start,
            })
        }
    }
    return incidents.reverse().slice(0, MAX_INCIDENTS)
}

export function parseName(friendlyName: string): ParsedName {
    const [group = '', ...rest] = friendlyName.split(GROUP_SEPARATOR)
    const name = rest.join(' / ').trim()
    if (!group.trim() || !name)
        return { group: null, name: friendlyName.trim() }
    return { group: group.trim(), name }
}

export function slugify(value: string): string {
    return slugifyText(value) || 'monitor'
}

export function toStatusData(
    raw: UptimeRobotMonitor[],
    now: number
): StatusData {
    const dayStarts = getDayStarts(now)
    const parsed = raw
        .map(monitor => ({ monitor, ...parseName(monitor.friendly_name) }))
        .sort(
            (a, b) =>
                compareGroups(a.group, b.group) || a.name.localeCompare(b.name)
        )
    const ids = uniqueIds(
        parsed.map(entry => entry.monitor),
        parsed.map(entry => entry.name)
    )
    const monitors = parsed.map((entry, index) =>
        toMonitorStatus(entry.monitor, ids[index] ?? '', entry.name, dayStarts)
    )
    const maintenance = parseMaintenance(raw, now)

    const groups: MonitorGroup[] = []
    parsed.forEach((entry, index) => {
        const base = monitors[index]
        if (!base) return
        const monitor = {
            ...base,
            outages: base.outages.slice(0, MAX_OUTAGES),
        }
        const last = groups.at(-1)
        if (last?.name === entry.group) last.monitors.push(monitor)
        else groups.push({ monitors: [monitor], name: entry.group })
    })

    return {
        dayStarts,
        groups,
        incidents: mergeIncidents(
            monitors.flatMap(monitor =>
                monitor.outages.map(outage => ({
                    ...outage,
                    monitor: monitor.name,
                }))
            )
        ),
        maintenance,
        overall: getOverall(monitors, maintenance, now),
        stale: false,
        updatedAt: now,
    }
}

function compareGroups(a: null | string, b: null | string): number {
    if (a === b) return 0
    if (a === null) return -1
    if (b === null) return 1
    return a.localeCompare(b)
}

function parseMaintenance(
    monitors: UptimeRobotMonitor[],
    now: number
): MaintenanceWindow[] {
    const windows = new Map<number, MaintenanceWindow>()
    for (const entry of monitors.flatMap(monitor => monitor.mwindows ?? [])) {
        const start = Number(entry.start_time)
        const end = start + entry.duration * 60
        const isUsable =
            entry.type === ONE_TIME_WINDOW &&
            entry.status === ACTIVE_WINDOW &&
            Number.isFinite(start)
        if (!isUsable || end <= now) continue
        windows.set(entry.id, {
            end,
            name: entry.friendly_name?.trim() || 'Scheduled maintenance',
            start,
        })
    }
    return [...windows.values()].sort((a, b) => a.start - b.start)
}

function parseOutages(
    monitor: UptimeRobotMonitor,
    state: MonitorState,
    since: number
): Outage[] {
    return (monitor.logs ?? [])
        .filter(log => log.type === DOWN_LOG && log.datetime >= since)
        .sort((a, b) => b.datetime - a.datetime)
        .map((log, index) => ({
            end:
                index === 0 && state === 'down'
                    ? null
                    : log.datetime + log.duration,
            start: log.datetime,
        }))
}

function parseUptime(
    monitor: UptimeRobotMonitor,
    dayStarts: [number, ...number[]]
): Pick<MonitorStatus, 'days' | 'uptime'> {
    const ratios = monitor.custom_uptime_ranges
        .split('-')
        .map(value => (value === '' ? Number.NaN : Number(value)))
    const isComplete =
        ratios.length === HISTORY_DAYS + 1 && ratios.every(Number.isFinite)
    return {
        days: dayStarts.map((start, index) =>
            !isComplete || start + DAY_SECONDS <= monitor.create_datetime
                ? null
                : (ratios[index] ?? null)
        ),
        uptime: isComplete ? (ratios[HISTORY_DAYS] ?? null) : null,
    }
}

function toMonitorStatus(
    monitor: UptimeRobotMonitor,
    id: string,
    name: string,
    dayStarts: [number, ...number[]]
): MonitorStatus {
    const state = STATES[monitor.status] ?? 'pending'
    const average = Number(monitor.average_response_time)
    return {
        averageResponseTime: average > 0 ? Math.round(average) : null,
        id,
        ...parseUptime(monitor, dayStarts),
        name,
        outages: parseOutages(monitor, state, dayStarts[0]),
        responseTimes: (monitor.response_times ?? [])
            .map(point => ({ at: point.datetime, ms: point.value }))
            .sort((a, b) => a.at - b.at),
        state,
    }
}

function uniqueIds(monitors: UptimeRobotMonitor[], names: string[]): string[] {
    const slugs = names.map(slugify)
    const oldest = new Map<string, number>()
    slugs.forEach((slug, index) => {
        const id = monitors[index]?.id
        if (id === undefined) return
        oldest.set(slug, Math.min(oldest.get(slug) ?? id, id))
    })
    return slugs.map((slug, index) => {
        const id = monitors[index]?.id

        return oldest.get(slug) === id ? slug : `${slug}-${String(id)}`
    })
}
