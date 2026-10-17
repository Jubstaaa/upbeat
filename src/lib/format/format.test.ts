import { describe, expect, it } from 'vitest'

import {
    dayTone,
    formatAgo,
    formatDateTime,
    formatDay,
    formatDuration,
    formatIncidentTitle,
    formatOutageDuration,
    formatPercent,
} from './format'

const OCT_14 = 1_791_936_000

describe('formatPercent', () => {
    it.each([
        [100, '100%'],
        [100.0004, '100%'],
        [99.996, '99.99%'],
        [99.99, '99.99%'],
        [99.5, '99.50%'],
        [0, '0.00%'],
        [null, '—'],
    ])('%s → %s', (value, expected) => {
        expect(formatPercent(value)).toBe(expected)
    })
})

describe('formatDuration', () => {
    it.each([
        [30, 'less than a minute'],
        [420, '7m'],
        [3_900, '1h 5m'],
        [86_400, '1d'],
        [90_000, '1d 1h'],
    ])('%s seconds → %s', (seconds, expected) => {
        expect(formatDuration(seconds)).toBe(expected)
    })
})

describe('formatAgo', () => {
    it.each([
        [0, 'just now'],
        [59, 'just now'],
        [60, '1 min ago'],
        [7_200, '2 h ago'],
        [172_800, '2 d ago'],
    ])('%s seconds → %s', (seconds, expected) => {
        expect(formatAgo(seconds)).toBe(expected)
    })
})

describe('dates', () => {
    it('formats a day in UTC', () => {
        expect(formatDay(OCT_14)).toBe('Oct 14')
    })

    it('formats a time just after midnight as 00, not 24', () => {
        expect(formatDateTime(OCT_14 + 300)).toBe('Oct 14, 00:05 UTC')
    })

    it('formats an afternoon time', () => {
        expect(formatDateTime(OCT_14 + 14 * 3_600 + 5 * 60)).toBe(
            'Oct 14, 14:05 UTC'
        )
    })
})

describe('dayTone', () => {
    it.each([
        [null, 'none'],
        [100, 'up'],
        [99.5, 'warn'],
        [99, 'warn'],
        [98.9, 'down'],
    ] as const)('%s → %s', (value, expected) => {
        expect(dayTone(value)).toBe(expected)
    })
})

describe('incidents', () => {
    it('names a single service', () => {
        expect(
            formatIncidentTitle({
                end: 10,
                monitors: ['API'],
                ongoing: [],
                start: 0,
            })
        ).toBe('API was down')
        expect(
            formatIncidentTitle({
                end: null,
                monitors: ['API'],
                ongoing: ['API'],
                start: 0,
            })
        ).toBe('API is down')
    })

    it('counts several services', () => {
        expect(
            formatIncidentTitle({
                end: 10,
                monitors: ['A', 'B'],
                ongoing: [],
                start: 0,
            })
        ).toBe('2 services were down')
        expect(
            formatIncidentTitle({
                end: null,
                monitors: ['A', 'B', 'C'],
                ongoing: ['A', 'B', 'C'],
                start: 0,
            })
        ).toBe('3 services are down')
    })

    it('names only the services still down in an ongoing incident', () => {
        expect(
            formatIncidentTitle({
                end: null,
                monitors: ['A', 'B'],
                ongoing: ['A'],
                start: 0,
            })
        ).toBe('A is down')
    })

    it('describes how long an outage lasted', () => {
        expect(formatOutageDuration({ end: 420, start: 0 })).toBe('7m')
        expect(formatOutageDuration({ end: null, start: 0 })).toBe('ongoing')
    })
})
