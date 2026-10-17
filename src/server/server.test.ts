import { describe, expect, it } from 'vitest'

import type { SiteConfig } from '@/lib/config/config.types'
import { createDemoMonitors } from '@/lib/demo/demo'
import type { StatusResult } from '@/lib/status/status.types'
import { toStatusData } from '@/lib/status/status.utils'

import { createApp } from './server'

const NOW = 1_791_972_000

const CONFIG: SiteConfig = {
    accentColor: '#6366f1',
    apiKey: 'ur-secret-key',
    demo: false,
    description: 'Our services',
    logo: null,
    title: 'Acme Status',
    url: null,
}

function app(result: StatusResult | Error, config: SiteConfig = CONFIG) {
    return createApp({
        getConfig: () => config,
        getStatus: () =>
            result instanceof Error
                ? Promise.reject(result)
                : Promise.resolve(result),
    })
}

const ok: StatusResult = {
    data: toStatusData(createDemoMonitors(NOW), NOW),
    kind: 'ok',
}

describe('GET /api/status', () => {
    it('returns the data and the public site settings', async () => {
        const response = await app(ok).request('/api/status')
        expect(response.status).toBe(200)
        expect(response.headers.get('cache-control')).toContain('max-age=60')
        const body = await response.json()
        expect(body.result.kind).toBe('ok')
        expect(body.result.data.groups).toHaveLength(3)
        expect(body.site).toEqual({
            accentColor: '#6366f1',
            description: 'Our services',
            logo: null,
            title: 'Acme Status',
        })
    })

    it('never sends the API key', async () => {
        const text = await (await app(ok).request('/api/status')).text()
        expect(text).not.toContain('ur-secret-key')
    })

    it('reports setup and errors without caching them', async () => {
        const setup = await app({ kind: 'setup' }).request('/api/status')
        expect(setup.status).toBe(503)
        expect((await setup.json()).result).toEqual({ kind: 'setup' })
        expect(setup.headers.get('cache-control')).toBe('no-store')
        const failed = await app(new Error('boom')).request('/api/status')
        expect(failed.status).toBe(503)
        expect((await failed.json()).result).toEqual({ kind: 'error' })
    })
})

describe('GET /badge.svg', () => {
    it('renders the overall badge', async () => {
        const response = await app(ok).request('/badge.svg')
        expect(response.headers.get('content-type')).toContain('image/svg+xml')
        expect(await response.text()).toContain('operational')
    })

    it('renders one monitor and falls back to unknown', async () => {
        expect(
            await (
                await app(ok).request('/badge.svg?monitor=public-api')
            ).text()
        ).toContain('Public API')
        expect(
            await (await app(new Error('boom')).request('/badge.svg')).text()
        ).toContain('unknown')
    })
})

describe('GET /feed.xml', () => {
    it('links to SITE_URL, or to the request origin without it', async () => {
        const fromOrigin = await app(ok).request(
            'https://status.example.com/feed.xml'
        )
        expect(fromOrigin.headers.get('content-type')).toContain(
            'application/atom+xml'
        )
        expect(await fromOrigin.text()).toContain(
            'https://status.example.com/feed.xml'
        )
        const fromConfig = await app(ok, {
            ...CONFIG,
            url: 'https://status.acme.dev',
        }).request('http://localhost/feed.xml')
        expect(await fromConfig.text()).toContain(
            'https://status.acme.dev/feed.xml'
        )
    })

    it('still answers when the status fails', async () => {
        const response = await app(new Error('boom')).request('/feed.xml')
        expect(response.status).toBe(200)
        expect(await response.text()).not.toContain('<entry>')
    })
})
