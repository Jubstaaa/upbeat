import { describe, expect, it } from 'vitest'

import { createDemoMonitors } from '@/lib/demo/demo'
import { toStatusData } from '@/lib/status/status.utils'

import { getBadgeContent, renderBadge } from './badge'

const NOW = 1_791_972_000
const ok = {
    data: toStatusData(createDemoMonitors(NOW), NOW),
    kind: 'ok',
} as const

describe('getBadgeContent', () => {
    it('shows the overall state', () => {
        expect(getBadgeContent(ok, null)).toEqual({
            color: '#22a06b',
            label: 'status',
            message: 'operational',
        })
    })

    it('shows one monitor', () => {
        expect(getBadgeContent(ok, 'public-api')).toMatchObject({
            label: 'Public API',
            message: expect.stringMatching(/^up \d/),
        })
    })

    it('falls back to unknown', () => {
        const unknown = {
            color: '#9f9f9f',
            label: 'status',
            message: 'unknown',
        }
        expect(getBadgeContent(ok, 'nope')).toEqual(unknown)
        expect(getBadgeContent({ kind: 'error' }, null)).toEqual(unknown)
        expect(getBadgeContent({ kind: 'setup' }, 'public-api')).toEqual(
            unknown
        )
    })
})

describe('renderBadge', () => {
    it('renders an accessible SVG', () => {
        const svg = renderBadge({
            color: '#22a06b',
            label: 'status',
            message: 'operational',
        })
        expect(svg).toMatch(/^<svg /)
        expect(svg).toContain('aria-label="status: operational"')
        expect(svg).toContain('fill="#22a06b"')
    })

    it('escapes monitor names', () => {
        const svg = renderBadge({
            color: '#555',
            label: '<b>R&D</b>',
            message: 'up',
        })
        expect(svg).toContain('&lt;b&gt;R&amp;D&lt;/b&gt;')
        expect(svg).not.toContain('<b>')
    })

    it('widens with longer text', () => {
        const width = (svg: string) => Number(/width="(\d+)"/.exec(svg)?.[1])
        expect(
            width(
                renderBadge({
                    color: '#555',
                    label: 'status',
                    message: 'a much longer message',
                })
            )
        ).toBeGreaterThan(
            width(
                renderBadge({ color: '#555', label: 'status', message: 'up' })
            )
        )
    })
})
