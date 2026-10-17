import { describe, expect, it } from 'vitest'

import { toStatusData } from '@/lib/status/status.utils'

import { createDemoMonitors } from './demo'

const NOW = 1_791_972_000

describe('demo data', () => {
    const data = toStatusData(createDemoMonitors(NOW), NOW)

    it('is operational with three groups, ungrouped first', () => {
        expect(data.overall).toBe('operational')
        expect(data.groups.map(group => group.name)).toEqual([
            null,
            'APIs',
            'Websites',
        ])
        expect(
            data.groups.flatMap(group =>
                group.monitors.map(monitor => monitor.id)
            )
        ).toEqual([
            'status-page',
            'public-api',
            'webhooks',
            'blog',
            'documentation',
            'marketing-site',
        ])
    })

    it('has a merged incident and full response-time series', () => {
        expect(
            data.incidents.some(incident => incident.monitors.length === 2)
        ).toBe(true)
        expect(data.groups[1].monitors[0].responseTimes).toHaveLength(288)
    })

    it('shows the blog as created 40 days ago', () => {
        const blog = data.groups[2].monitors[0]
        expect(blog.days.filter(day => day === null)).toHaveLength(49)
    })

    it('is deterministic', () => {
        expect(createDemoMonitors(NOW)).toEqual(createDemoMonitors(NOW))
    })
})
