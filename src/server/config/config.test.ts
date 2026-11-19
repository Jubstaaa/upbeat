import { afterEach, describe, expect, it, vi } from 'vitest'

import { readConfig } from './config'

describe('readConfig', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('uses defaults when nothing is set', () => {
        expect(readConfig({})).toEqual({
            accentColor: null,
            apiKey: null,
            demo: false,
            description: 'Live status and uptime.',
            logo: null,
            title: 'Status',
            url: null,
        })
    })

    it('reads and trims every variable', () => {
        expect(
            readConfig({
                ACCENT_COLOR: ' #6366F1 ',
                DEMO: 'TRUE',
                SITE_DESCRIPTION: 'Our services',
                SITE_LOGO: 'https://example.com/logo.svg',
                SITE_TITLE: 'Acme Status',
                SITE_URL: 'https://status.example.com/',
                UPTIMEROBOT_API_KEY: ' ur123-abc ',
            })
        ).toEqual({
            accentColor: '#6366F1',
            apiKey: 'ur123-abc',
            demo: true,
            description: 'Our services',
            logo: 'https://example.com/logo.svg',
            title: 'Acme Status',
            url: 'https://status.example.com',
        })
    })

    it('accepts a logo path on the same site', () => {
        expect(readConfig({ SITE_LOGO: '/logo.png' }).logo).toBe('/logo.png')
    })

    it('treats blank values as unset', () => {
        expect(
            readConfig({ SITE_TITLE: '   ', UPTIMEROBOT_API_KEY: '' })
        ).toMatchObject({
            apiKey: null,
            title: 'Status',
        })
    })

    it('ignores invalid values and reports each one', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        const config = readConfig({
            ACCENT_COLOR: 'green',
            SITE_LOGO: 'javascript:alert(1)',
            SITE_URL: 'status.example.com',
        })
        expect(config).toMatchObject({
            accentColor: null,
            logo: null,
            url: null,
        })
        expect(error).toHaveBeenCalledTimes(3)
        expect(error.mock.calls[0][0]).toContain('ACCENT_COLOR')
    })
})
