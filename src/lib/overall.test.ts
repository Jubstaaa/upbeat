import { describe, expect, it } from 'vitest'

import {
    getDocumentTitle,
    getFavicon,
    getOverallDetail,
    isAlertState,
} from './overall'
import type { MonitorStatus, StatusData } from './status.types'

function monitor(name: string, state: MonitorStatus['state']): MonitorStatus {
    return {
        averageResponseTime: null,
        days: [],
        id: name.toLowerCase(),
        name,
        outages: [],
        responseTimes: [],
        state,
        uptime: 100,
    }
}

function data(
    monitors: MonitorStatus[],
    overrides: Partial<StatusData> = {}
): StatusData {
    return {
        dayStarts: [],
        groups: [{ monitors, name: null }],
        incidents: [],
        maintenance: [],
        overall: 'operational',
        stale: false,
        updatedAt: 1_000,
        ...overrides,
    }
}

describe('getOverallDetail', () => {
    it('counts every watched service when all are up', () => {
        expect(
            getOverallDetail(
                data([
                    monitor('A', 'up'),
                    monitor('B', 'up'),
                    monitor('C', 'paused'),
                ])
            )
        ).toBe('All 2 services are up')
    })

    it('uses the singular for one service', () => {
        expect(getOverallDetail(data([monitor('A', 'up')]))).toBe(
            'The service is up'
        )
    })

    it('says how many are down', () => {
        const detail = getOverallDetail(
            data([monitor('A', 'down'), monitor('B', 'up')], {
                overall: 'degraded',
            })
        )
        expect(detail).toBe('1 of 2 services is down')
    })

    it('handles an account with nothing to watch', () => {
        expect(getOverallDetail(data([]))).toBe(
            'No monitors are being checked yet'
        )
        expect(getOverallDetail(data([monitor('A', 'paused')]))).toBe(
            'No monitors are being checked yet'
        )
    })

    it('names the active maintenance window', () => {
        const detail = getOverallDetail(
            data([monitor('A', 'up')], {
                maintenance: [
                    {
                        end: 1_791_936_000 + 3_600,
                        name: 'Database upgrade',
                        start: 0,
                    },
                ],
                overall: 'maintenance',
            })
        )
        expect(detail).toBe('Database upgrade until Oct 14, 01:00 UTC')
    })
})

describe('isAlertState', () => {
    it('is true only for outages', () => {
        expect(isAlertState('degraded')).toBe(true)
        expect(isAlertState('outage')).toBe(true)
        expect(isAlertState('operational')).toBe(false)
        expect(isAlertState('maintenance')).toBe(false)
    })
})

describe('getDocumentTitle', () => {
    it('keeps the plain title while operational', () => {
        expect(getDocumentTitle('operational', 'Acme Status')).toBe(
            'Acme Status'
        )
    })

    it('leads with the problem otherwise', () => {
        expect(getDocumentTitle('outage', 'Acme Status')).toBe(
            'Major outage · Acme Status'
        )
    })
})

describe('getFavicon', () => {
    it('is an SVG data URL in the state colour', () => {
        expect(getFavicon('operational')).toMatch(/^data:image\/svg\+xml,/)
        expect(decodeURIComponent(getFavicon('outage'))).toContain('#e5484d')
        expect(decodeURIComponent(getFavicon(null))).toContain('#9f9f9f')
    })
})
