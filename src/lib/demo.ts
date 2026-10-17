import type { DemoMonitor } from './demo.types'
import { DAY_SECONDS, getDayStarts, HISTORY_DAYS } from './transform'
import type { UptimeRobotMonitor } from './uptimerobot.types'

const RESPONSE_POINTS = 288
const RESPONSE_INTERVAL = 300

const DEMO_MONITORS: DemoMonitor[] = [
    {
        createdDaysAgo: 400,
        name: 'Websites / Marketing site',
        outages: [{ daysAgo: 12, hour: 3, minutes: 7 }],
        responseMs: 210,
    },
    {
        createdDaysAgo: 400,
        name: 'Websites / Documentation',
        outages: [{ daysAgo: 12, hour: 3, minutes: 6 }],
        responseMs: 160,
    },
    {
        createdDaysAgo: 40,
        name: 'Websites / Blog',
        outages: [],
        responseMs: 240,
    },
    {
        createdDaysAgo: 400,
        name: 'APIs / Public API',
        outages: [
            { daysAgo: 30, hour: 14, minutes: 42 },
            { daysAgo: 2, hour: 9, minutes: 3 },
        ],
        responseMs: 120,
    },
    {
        createdDaysAgo: 400,
        name: 'APIs / Webhooks',
        outages: [{ daysAgo: 55, hour: 22, minutes: 95 }],
        responseMs: 95,
    },
    { createdDaysAgo: 400, name: 'Status page', outages: [], responseMs: 60 },
]

function seeded(seed: number): () => number {
    let state = seed
    return () => {
        state = (state * 1_103_515_245 + 12_345) % 2_147_483_648
        return state / 2_147_483_648
    }
}

function toMonitor(
    spec: DemoMonitor,
    index: number,
    now: number
): UptimeRobotMonitor {
    const dayStarts = getDayStarts(now)
    const today = dayStarts[HISTORY_DAYS - 1]
    const logs = spec.outages.map(outage => ({
        datetime: today - outage.daysAgo * DAY_SECONDS + outage.hour * 3_600,
        duration: outage.minutes * 60,
        type: 1,
    }))
    const downtime = (start: number, end: number) =>
        logs
            .filter(log => log.datetime >= start && log.datetime < end)
            .reduce((sum, log) => sum + log.duration, 0)
    const days = dayStarts.map(start =>
        (
            100 *
            (1 - downtime(start, start + DAY_SECONDS) / DAY_SECONDS)
        ).toFixed(3)
    )
    const total = 100 * (1 - downtime(dayStarts[0], now) / (now - dayStarts[0]))
    const random = seeded(index + 1)

    return {
        average_response_time: String(spec.responseMs),
        create_datetime: now - spec.createdDaysAgo * DAY_SECONDS,
        custom_uptime_ranges: [...days, total.toFixed(3)].join('-'),
        friendly_name: spec.name,
        id: index + 1,
        logs,
        mwindows: [],
        response_times: Array.from({ length: RESPONSE_POINTS }, (_, point) => ({
            datetime: now - point * RESPONSE_INTERVAL,
            value: Math.round(
                spec.responseMs * (0.85 + 0.3 * random()) +
                    25 * Math.sin(point / 18)
            ),
        })),
        status: 2,
    }
}

export function createDemoMonitors(now: number): UptimeRobotMonitor[] {
    return DEMO_MONITORS.map((spec, index) => toMonitor(spec, index, now))
}
