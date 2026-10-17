import { afterEach, describe, expect, it, vi } from 'vitest'

import { UptimeRobotKeyError } from '@/lib/uptimerobot/uptimerobot'
import type { UptimeRobotMonitor } from '@/lib/uptimerobot/uptimerobot.types'

import { createStatusSource } from './status'

const START = 1_791_972_000_000

function monitor(): UptimeRobotMonitor {
    return {
        create_datetime: 0,
        custom_uptime_ranges: Array(91).fill('100.000').join('-'),
        friendly_name: 'Website',
        id: 1,
        status: 2,
    }
}

function setup(load: () => Promise<UptimeRobotMonitor[]>) {
    let now = START
    const fetchMonitors = vi.fn(load)
    const source = createStatusSource({ clock: () => now, fetchMonitors })
    return {
        advance: (ms: number) => {
            now += ms
        },
        fetchMonitors,
        source,
    }
}

describe('createStatusSource', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('serves one fetch for a minute', async () => {
        const { advance, fetchMonitors, source } = setup(async () => [
            monitor(),
        ])
        const first = await source()
        advance(59_000)
        await source()
        expect(fetchMonitors).toHaveBeenCalledTimes(1)
        expect(first).toMatchObject({
            data: { stale: false, updatedAt: START / 1000 },
            kind: 'ok',
        })
        advance(2_000)
        await source()
        expect(fetchMonitors).toHaveBeenCalledTimes(2)
    })

    it('shares one request between concurrent callers', async () => {
        const { fetchMonitors, source } = setup(async () => [monitor()])
        const [a, b] = await Promise.all([source(), source()])
        expect(fetchMonitors).toHaveBeenCalledTimes(1)
        expect(a).toBe(b)
    })

    it('keeps serving the last data, marked stale, when a refresh fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const responses = [
            async () => [monitor()],
            async () => Promise.reject(new Error('timeout')),
        ]
        const { advance, source } = setup(() =>
            (responses.shift() ?? responses[0])()
        )
        await source()
        advance(61_000)
        expect(await source()).toMatchObject({
            data: { stale: true },
            kind: 'ok',
        })
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('timeout')
        )
    })

    it('reports an error when nothing has loaded yet, and retries after five seconds', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const { advance, fetchMonitors, source } = setup(async () =>
            Promise.reject(new Error('down'))
        )
        expect(await source()).toEqual({ kind: 'error' })
        advance(2_000)
        await source()
        expect(fetchMonitors).toHaveBeenCalledTimes(1)
        advance(4_000)
        await source()
        expect(fetchMonitors).toHaveBeenCalledTimes(2)
    })

    it('starts a new request when the shared one has hung', async () => {
        const responses = [
            () => new Promise<UptimeRobotMonitor[]>(() => {}),
            async () => [monitor()],
        ]
        const { advance, fetchMonitors, source } = setup(() =>
            (responses.shift() ?? responses[0])()
        )
        void source()
        advance(16_000)
        expect(await source()).toMatchObject({ kind: 'ok' })
        expect(fetchMonitors).toHaveBeenCalledTimes(2)
    })

    it('asks for setup when the key is rejected', async () => {
        const { source } = setup(async () =>
            Promise.reject(new UptimeRobotKeyError())
        )
        expect(await source()).toEqual({ kind: 'setup' })
    })
})
