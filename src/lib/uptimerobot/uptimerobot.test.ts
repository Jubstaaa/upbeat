import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMonitors, UptimeRobotKeyError } from './uptimerobot'
import type { MonitorQuery, UptimeRobotMonitor } from './uptimerobot.types'

const KEY = 'ur123-secret'
const QUERY: MonitorQuery = {
    logsStart: 100,
    now: 200,
    ranges: '100_150-150_200',
    responseTimesStart: 50,
}

function monitor(id: number): UptimeRobotMonitor {
    return {
        create_datetime: 0,
        custom_uptime_ranges: '100.000',
        friendly_name: `Monitor ${id}`,
        id,
        status: 2,
    }
}

function respond(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
        status,
    })
}

describe('fetchMonitors', () => {
    const fetchMock = vi.fn<typeof fetch>()

    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('asks for everything the page needs in one request', async () => {
        fetchMock.mockResolvedValueOnce(
            respond({
                monitors: [monitor(1)],
                pagination: { limit: 50, offset: 0, total: 1 },
                stat: 'ok',
            })
        )
        await expect(fetchMonitors(KEY, QUERY)).resolves.toEqual([monitor(1)])
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('https://api.uptimerobot.com/v2/getMonitors')
        const body = new URLSearchParams(String(init?.body))
        expect(Object.fromEntries(body)).toMatchObject({
            api_key: KEY,
            custom_uptime_ranges: '100_150-150_200',
            limit: '50',
            log_types: '1',
            logs: '1',
            logs_end_date: '200',
            logs_start_date: '100',
            mwindows: '1',
            offset: '0',
            response_times: '1',
            response_times_end_date: '200',
            response_times_start_date: '50',
        })
    })

    it('follows pagination', async () => {
        fetchMock
            .mockResolvedValueOnce(
                respond({
                    monitors: [monitor(1)],
                    pagination: { limit: 50, offset: 0, total: 60 },
                    stat: 'ok',
                })
            )
            .mockResolvedValueOnce(
                respond({
                    monitors: [monitor(2)],
                    pagination: { limit: 50, offset: 50, total: 60 },
                    stat: 'ok',
                })
            )
        await expect(fetchMonitors(KEY, QUERY)).resolves.toEqual([
            monitor(1),
            monitor(2),
        ])
        expect(
            new URLSearchParams(String(fetchMock.mock.calls[1][1]?.body)).get(
                'offset'
            )
        ).toBe('50')
    })

    it('returns an empty list for an empty account', async () => {
        fetchMock.mockResolvedValueOnce(
            respond({
                monitors: [],
                pagination: { limit: 50, offset: 0, total: 0 },
                stat: 'ok',
            })
        )
        await expect(fetchMonitors(KEY, QUERY)).resolves.toEqual([])
    })

    it('recognises a rejected key', async () => {
        fetchMock.mockResolvedValueOnce(
            respond({
                error: {
                    message: 'api_key not found.',
                    parameter_name: 'api_key',
                    type: 'invalid_parameter',
                },
                stat: 'fail',
            })
        )
        await expect(fetchMonitors(KEY, QUERY)).rejects.toBeInstanceOf(
            UptimeRobotKeyError
        )
    })

    it('fails on other errors without leaking the key', async () => {
        fetchMock.mockResolvedValueOnce(
            respond({ error: { type: 'internal' }, stat: 'fail' })
        )
        const error = await fetchMonitors(KEY, QUERY).catch(
            (reason: unknown) => reason
        )
        expect(error).toBeInstanceOf(Error)
        expect(error).not.toBeInstanceOf(UptimeRobotKeyError)
        expect(String(error)).not.toContain(KEY)
    })

    it('fails on an HTTP error', async () => {
        fetchMock.mockResolvedValueOnce(new Response('busy', { status: 429 }))
        await expect(fetchMonitors(KEY, QUERY)).rejects.toThrow('HTTP 429')
    })
})
