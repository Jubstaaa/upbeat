import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

import type { SiteConfig } from '@/server/config/config.types'
import type { StatusResult } from '@/status/status.types'

import { createDemoMonitors } from '@/server/demo/demo'
import { toStatusData } from '@/server/status/status.utils'

import { parseHeadersFile } from './headers-file'
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

function app(result: Error | StatusResult, config: SiteConfig = CONFIG) {
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
        const body = (await response.json()) as {
            result: { data: { groups: unknown[] }; kind: string }
            site: unknown
        }
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
        expect(((await setup.json()) as { result: unknown }).result).toEqual({
            kind: 'setup',
        })
        expect(setup.headers.get('cache-control')).toBe('no-store')
        const failed = await app(new Error('boom')).request('/api/status')
        expect(failed.status).toBe(503)
        expect(((await failed.json()) as { result: unknown }).result).toEqual({
            kind: 'error',
        })
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

    it('rejects a monitor id that cannot be a slug', async () => {
        for (const monitor of ['<script>', 'a'.repeat(200), 'Public API']) {
            const response = await app(ok).request(
                `/badge.svg?monitor=${encodeURIComponent(monitor)}`
            )
            expect(response.status).toBe(400)
        }
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

describe('errors', () => {
    it('logs an unexpected status failure instead of hiding it', async () => {
        const log = vi.spyOn(console, 'error').mockImplementation(() => {})
        await app(new Error('boom')).request('/api/status')
        expect(log).toHaveBeenCalledWith(expect.stringContaining('boom'))
        log.mockRestore()
    })
})

describe('security headers', () => {
    const allPaths = parseHeadersFile(
        readFileSync('public/_headers', 'utf8')
    ).find(rule => rule.path === '/*')
    const staticHeaders = new Map(
        Object.entries(allPaths?.headers ?? {}).map(([name, value]) => [
            name.toLowerCase(),
            value,
        ])
    )

    it('protects static assets with a CSP and the usual hardening headers', () => {
        expect(staticHeaders.get('content-security-policy')).toContain(
            "default-src 'self'"
        )
        expect(staticHeaders.get('x-content-type-options')).toBe('nosniff')
        expect(staticHeaders.get('strict-transport-security')).toContain(
            'max-age='
        )
        expect(staticHeaders.get('referrer-policy')).toBeDefined()
        expect(staticHeaders.get('permissions-policy')).toBeDefined()
    })

    it('sends the same headers from every API route', async () => {
        for (const route of ['/api/status', '/badge.svg', '/feed.xml']) {
            const response = await app(ok).request(route)
            for (const [name, value] of staticHeaders)
                expect(response.headers.get(name), `${route} ${name}`).toBe(
                    value
                )
        }
    })

    it('allows Cloudflare Web Analytics, which Cloudflare injects', () => {
        const csp = staticHeaders.get('content-security-policy') ?? ''
        expect(csp).toMatch(
            /script-src [^;]*https:\/\/static\.cloudflareinsights\.com/
        )
        expect(csp).toMatch(
            /connect-src [^;]*https:\/\/cloudflareinsights\.com/
        )
    })

    it('lets other sites embed the badge', async () => {
        const response = await app(ok).request('/badge.svg')
        expect(response.headers.get('cross-origin-resource-policy')).toBe(
            'cross-origin'
        )
    })
})
