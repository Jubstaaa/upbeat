import { getConfig } from './config'
import { createDemoMonitors } from './demo'
import type {
    CachedResult,
    StatusData,
    StatusResult,
    StatusSource,
    StatusSourceOptions,
} from './status.types'
import { buildQuery, toStatusData } from './transform'
import { fetchMonitors, UptimeRobotKeyError } from './uptimerobot'

const FRESH_MS = 60_000
const RETRY_MS = 10_000
const HUNG_MS = 15_000

export function createStatusSource({
    clock = Date.now,
    fetchMonitors: load,
}: StatusSourceOptions): StatusSource {
    let cached: CachedResult | null = null
    let lastGood: StatusData | null = null
    let pending: Promise<StatusResult> | null = null
    let pendingSince = 0

    function remember(
        result: StatusResult,
        ttl: number,
        at: number
    ): StatusResult {
        cached = { expiresAt: at + ttl, result }
        return result
    }

    async function refresh(): Promise<StatusResult> {
        const startedAt = clock()
        const now = Math.floor(startedAt / 1_000)
        try {
            lastGood = toStatusData(await load(buildQuery(now)), now)
            return remember({ data: lastGood, kind: 'ok' }, FRESH_MS, startedAt)
        } catch (error) {
            if (error instanceof UptimeRobotKeyError)
                return remember({ kind: 'setup' }, RETRY_MS, startedAt)
            console.error(
                `upbeat: could not load UptimeRobot data (${error instanceof Error ? error.message : String(error)})`
            )
            if (lastGood)
                return remember(
                    { data: { ...lastGood, stale: true }, kind: 'ok' },
                    FRESH_MS,
                    startedAt
                )
            return remember({ kind: 'error' }, RETRY_MS, startedAt)
        }
    }

    return function getCachedStatus() {
        const now = clock()
        if (cached && now < cached.expiresAt)
            return Promise.resolve(cached.result)
        if (!pending || now - pendingSince > HUNG_MS) {
            const request: Promise<StatusResult> = refresh().finally(() => {
                if (pending === request) pending = null
            })
            pending = request
            pendingSince = now
        }
        return pending
    }
}

let source: StatusSource | null = null

export function getStatus(): Promise<StatusResult> {
    const { apiKey, demo } = getConfig()
    if (demo) {
        const now = Math.floor(Date.now() / 1_000)
        return Promise.resolve({
            data: toStatusData(createDemoMonitors(now), now),
            kind: 'ok',
        })
    }
    if (!apiKey) return Promise.resolve({ kind: 'setup' })
    source ??= createStatusSource({
        fetchMonitors: query => fetchMonitors(apiKey, query),
    })
    return source()
}
