import { describe, expect, it } from 'vitest'

import type { UptimeRobotMonitor } from '@/lib/uptimerobot/uptimerobot.types'

import type { MonitorStatus } from './status.types'
import {
    buildQuery,
    DAY_SECONDS,
    getDayStarts,
    getOverall,
    HISTORY_DAYS,
    mergeIncidents,
    parseName,
    slugify,
    toStatusData,
} from './status.utils'

const TODAY = 1_791_936_000
const NOW = TODAY + 10 * 3_600
const FIRST_DAY = TODAY - (HISTORY_DAYS - 1) * DAY_SECONDS

function ranges(
    days: string[] = Array(HISTORY_DAYS).fill('100.000'),
    total = '100.000'
): string {
    return [...days, total].join('-')
}

function makeMonitor(
    overrides: Partial<UptimeRobotMonitor> = {}
): UptimeRobotMonitor {
    return {
        average_response_time: '200.4',
        create_datetime: NOW - 200 * DAY_SECONDS,
        custom_uptime_ranges: ranges(),
        friendly_name: 'Website',
        id: 1,
        logs: [],
        mwindows: [],
        response_times: [],
        status: 2,
        ...overrides,
    }
}

function status(state: MonitorStatus['state']): MonitorStatus {
    return {
        averageResponseTime: null,
        days: [],
        id: state,
        name: state,
        outages: [],
        responseTimes: [],
        state,
        uptime: 100,
    }
}

function allMonitors(monitors: UptimeRobotMonitor[]): MonitorStatus[] {
    return toStatusData(monitors, NOW).groups.flatMap(group => group.monitors)
}

describe('days', () => {
    it('covers the last 90 UTC days ending today', () => {
        const days = getDayStarts(NOW)
        expect(days).toHaveLength(HISTORY_DAYS)
        expect(days[0]).toBe(FIRST_DAY)
        expect(days.at(-1)).toBe(TODAY)
    })

    it('builds one range per day plus the whole span', () => {
        const query = buildQuery(NOW)
        const parts = query.ranges.split('-')
        expect(parts).toHaveLength(HISTORY_DAYS + 1)
        expect(parts[0]).toBe(`${FIRST_DAY}_${FIRST_DAY + DAY_SECONDS}`)
        expect(parts.at(-1)).toBe(`${FIRST_DAY}_${NOW}`)
        expect(query).toMatchObject({
            logsStart: FIRST_DAY,
            now: NOW,
            responseTimesStart: NOW - DAY_SECONDS,
        })
    })
})

describe('parseName', () => {
    it('splits a group from the name', () => {
        expect(parseName('Websites / webgooh.tech')).toEqual({
            group: 'Websites',
            name: 'webgooh.tech',
        })
    })

    it('leaves URL-like names alone', () => {
        expect(parseName('api.example.com/health')).toEqual({
            group: null,
            name: 'api.example.com/health',
        })
    })

    it('splits only on the first separator', () => {
        expect(parseName('APIs / v2 / users')).toEqual({
            group: 'APIs',
            name: 'v2 / users',
        })
    })

    it('ignores an empty group or name', () => {
        expect(parseName(' / x')).toEqual({ group: null, name: '/ x' })
        expect(parseName('x / ')).toEqual({ group: null, name: 'x /' })
    })
})

describe('slugify', () => {
    it('makes a URL-safe id', () => {
        expect(slugify('Public API (v2)')).toBe('public-api-v2')
        expect(slugify('Café')).toBe('cafe')
        expect(slugify('!!!')).toBe('monitor')
        expect(slugify('beta.example.com')).toBe('beta-example-com')
    })
})

describe('toStatusData', () => {
    it('maps every UptimeRobot status', () => {
        const states = [0, 1, 2, 8, 9, 42].map(
            code =>
                allMonitors([
                    makeMonitor({ friendly_name: `m${code}`, status: code }),
                ])[0].state
        )
        expect(states).toEqual([
            'paused',
            'pending',
            'up',
            'down',
            'down',
            'pending',
        ])
    })

    it('blanks the days before the monitor existed', () => {
        const [monitor] = allMonitors([
            makeMonitor({
                create_datetime: FIRST_DAY + 10 * DAY_SECONDS + 3_600,
            }),
        ])
        expect(monitor.days.slice(0, 10)).toEqual(Array(10).fill(null))
        expect(monitor.days[10]).toBe(100)
        expect(monitor.uptime).toBe(100)
    })

    it('treats malformed uptime ranges as no data', () => {
        const [monitor] = allMonitors([
            makeMonitor({ custom_uptime_ranges: '100.000-99' }),
        ])
        expect(monitor.days.every(day => day === null)).toBe(true)
        expect(monitor.uptime).toBeNull()
        const [empty] = allMonitors([makeMonitor({ custom_uptime_ranges: '' })])
        expect(empty.uptime).toBeNull()
    })

    it('rounds the average response time and sorts response times', () => {
        const [monitor] = allMonitors([
            makeMonitor({
                response_times: [
                    { datetime: NOW - 60, value: 120 },
                    { datetime: NOW - 600, value: 90 },
                ],
            }),
        ])
        expect(monitor.averageResponseTime).toBe(200)
        expect(monitor.responseTimes).toEqual([
            { at: NOW - 600, ms: 90 },
            { at: NOW - 60, ms: 120 },
        ])
        expect(
            allMonitors([makeMonitor({ average_response_time: '0' })])[0]
                .averageResponseTime
        ).toBeNull()
    })

    it('groups monitors, ungrouped first, both sorted by name', () => {
        const data = toStatusData(
            [
                makeMonitor({ friendly_name: 'Websites / b.com' }),
                makeMonitor({ friendly_name: 'APIs / Public' }),
                makeMonitor({ friendly_name: 'Websites / a.com' }),
                makeMonitor({ friendly_name: 'Status' }),
            ],
            NOW
        )
        expect(
            data.groups.map(group => [
                group.name,
                group.monitors.map(monitor => monitor.name),
            ])
        ).toEqual([
            [null, ['Status']],
            ['APIs', ['Public']],
            ['Websites', ['a.com', 'b.com']],
        ])
    })

    it('gives duplicate names distinct ids', () => {
        const ids = allMonitors([
            makeMonitor({ friendly_name: 'EU / API' }),
            makeMonitor({ friendly_name: 'US / API' }),
        ]).map(monitor => monitor.id)
        expect(ids).toEqual(['api', 'api-2'])
    })

    it('lists outages newest first and marks the current one ongoing', () => {
        const [monitor] = allMonitors([
            makeMonitor({
                logs: [
                    { datetime: NOW - 7_200, duration: 600, type: 1 },
                    { datetime: NOW - 300, duration: 300, type: 1 },
                    { datetime: FIRST_DAY - 600, duration: 60, type: 1 },
                ],
                status: 9,
            }),
        ])
        expect(monitor.outages).toEqual([
            { end: null, start: NOW - 300 },
            { end: NOW - 6_600, start: NOW - 7_200 },
        ])
    })

    it('keeps at most ten outages per monitor', () => {
        const logs = Array.from({ length: 15 }, (_, index) => ({
            datetime: NOW - (index + 1) * 3_600,
            duration: 60,
            type: 1,
        }))
        expect(allMonitors([makeMonitor({ logs })])[0].outages).toHaveLength(10)
    })

    it('keeps only one-time maintenance windows that have not ended', () => {
        const window = {
            duration: 60,
            friendly_name: 'Upgrade',
            status: 1,
            type: 1,
        }
        const data = toStatusData(
            [
                makeMonitor({
                    mwindows: [
                        { ...window, id: 1, start_time: NOW + 3_600 },
                        { ...window, id: 2, start_time: NOW - 7_200 },
                        { ...window, id: 3, start_time: '10:00', type: 2 },
                        { ...window, id: 4, start_time: NOW + 60, status: 0 },
                    ],
                }),
                makeMonitor({
                    mwindows: [
                        { ...window, id: 1, start_time: String(NOW + 3_600) },
                    ],
                }),
            ],
            NOW
        )
        expect(data.maintenance).toEqual([
            { end: NOW + 7_200, name: 'Upgrade', start: NOW + 3_600 },
        ])
    })

    it('stamps the data with the fetch time and is never stale', () => {
        const data = toStatusData([], NOW)
        expect(data).toMatchObject({
            groups: [],
            incidents: [],
            overall: 'operational',
            stale: false,
            updatedAt: NOW,
        })
    })
})

describe('mergeIncidents', () => {
    it('merges outages that overlap or start within a minute', () => {
        expect(
            mergeIncidents([
                { end: 1_000, monitor: 'A', start: 500 },
                { end: 1_200, monitor: 'B', start: 1_050 },
                { end: 9_000, monitor: 'A', start: 8_000 },
            ])
        ).toEqual([
            { end: 9_000, monitors: ['A'], ongoing: [], start: 8_000 },
            { end: 1_200, monitors: ['A', 'B'], ongoing: [], start: 500 },
        ])
    })

    it('keeps an ongoing incident open', () => {
        expect(
            mergeIncidents([
                { end: null, monitor: 'A', start: 100 },
                { end: 5_000, monitor: 'B', start: 4_000 },
            ])
        ).toEqual([
            { end: null, monitors: ['A', 'B'], ongoing: ['A'], start: 100 },
        ])
    })

    it('counts only the monitors that are still down as ongoing', () => {
        expect(
            mergeIncidents([
                { end: null, monitor: 'A', start: 100 },
                { end: null, monitor: 'B', start: 130 },
                { end: 5_000, monitor: 'C', start: 4_000 },
            ])[0].ongoing
        ).toEqual(['A', 'B'])
    })

    it('returns the ten most recent', () => {
        const entries = Array.from({ length: 12 }, (_, index) => ({
            end: index * 10_000 + 60,
            monitor: 'A',
            start: index * 10_000,
        }))
        const incidents = mergeIncidents(entries)
        expect(incidents).toHaveLength(10)
        expect(incidents[0].start).toBe(110_000)
    })
})

describe('getOverall', () => {
    it('is operational when everything watched is up', () => {
        expect(getOverall([status('up'), status('paused')], [], NOW)).toBe(
            'operational'
        )
    })

    it('is degraded when some are down', () => {
        expect(getOverall([status('up'), status('down')], [], NOW)).toBe(
            'degraded'
        )
    })

    it('is an outage when every watched monitor is down', () => {
        expect(getOverall([status('down'), status('paused')], [], NOW)).toBe(
            'outage'
        )
    })

    it('is operational for an empty or all-paused account', () => {
        expect(getOverall([], [], NOW)).toBe('operational')
        expect(getOverall([status('paused')], [], NOW)).toBe('operational')
    })

    it('reports maintenance while a window is active', () => {
        expect(
            getOverall(
                [status('up')],
                [{ end: NOW + 60, name: 'x', start: NOW - 60 }],
                NOW
            )
        ).toBe('maintenance')
        expect(
            getOverall(
                [status('up')],
                [{ end: NOW + 120, name: 'x', start: NOW + 60 }],
                NOW
            )
        ).toBe('operational')
    })
})
