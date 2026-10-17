import type {
    MonitorQuery,
    UptimeRobotMonitor,
    UptimeRobotPage,
} from './uptimerobot.types'

const ENDPOINT = 'https://api.uptimerobot.com/v2/getMonitors'
const PAGE_SIZE = 50
const TIMEOUT_MS = 10_000
const DOWN_LOGS = '1'
const RESPONSE_TIME_AVERAGE_MINUTES = 15

export class UptimeRobotKeyError extends Error {
    constructor() {
        super('UptimeRobot rejected the API key')
        this.name = 'UptimeRobotKeyError'
    }
}

function buildBody(
    apiKey: string,
    query: MonitorQuery,
    offset: number
): URLSearchParams {
    return new URLSearchParams({
        api_key: apiKey,
        custom_uptime_ranges: query.ranges,
        format: 'json',
        limit: String(PAGE_SIZE),
        log_types: DOWN_LOGS,
        logs: '1',
        logs_end_date: String(query.now),
        logs_start_date: String(query.logsStart),
        mwindows: '1',
        offset: String(offset),
        response_times: '1',
        response_times_average: String(RESPONSE_TIME_AVERAGE_MINUTES),
        response_times_end_date: String(query.now),
        response_times_start_date: String(query.responseTimesStart),
    })
}

async function fetchPage(
    apiKey: string,
    query: MonitorQuery,
    offset: number
): Promise<UptimeRobotPage> {
    const response = await fetch(ENDPOINT, {
        body: buildBody(apiKey, query, offset),
        cache: 'no-store',
        method: 'POST',
        signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok)
        throw new Error(`UptimeRobot responded with HTTP ${response.status}`)
    const page = (await response.json()) as UptimeRobotPage
    if (page.stat === 'ok' && page.monitors) return page
    if (page.error?.parameter_name === 'api_key')
        throw new UptimeRobotKeyError()
    throw new Error(
        `UptimeRobot returned an error (${page.error?.type ?? 'unknown'})`
    )
}

export async function fetchMonitors(
    apiKey: string,
    query: MonitorQuery
): Promise<UptimeRobotMonitor[]> {
    const monitors: UptimeRobotMonitor[] = []
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const page = await fetchPage(apiKey, query, offset)
        monitors.push(...(page.monitors ?? []))
        if (offset + PAGE_SIZE >= (page.pagination?.total ?? 0)) return monitors
    }
}
