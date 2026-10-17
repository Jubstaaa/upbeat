import { Hono } from 'hono'
import { cache } from 'hono/cache'

import { getBadgeContent, renderBadge } from '@/lib/badge/badge'
import { renderFeed } from '@/lib/feed/feed'
import type { StatusResult } from '@/lib/status/status.types'

import type { ServerDeps, StatusResponse } from './server.types'

const CACHE_CONTROL = 'public, max-age=60'
const CACHED_ROUTES = ['/api/status', '/badge.svg', '/feed.xml']

export function createApp({ getConfig, getStatus }: ServerDeps): Hono {
    const app = new Hono()

    const loadStatus = (): Promise<StatusResult> =>
        getStatus().catch(() => ({ kind: 'error' }))

    if (typeof caches !== 'undefined') {
        for (const route of CACHED_ROUTES) {
            app.get(
                route,
                cache({
                    cacheControl: CACHE_CONTROL,
                    cacheName: 'upbeat',
                    wait: false,
                })
            )
        }
    }

    app.get('/api/status', async c => {
        const { accentColor, description, logo, title } = getConfig()
        const result = await loadStatus()
        const body: StatusResponse = {
            result,
            site: { accentColor, description, logo, title },
        }
        const isOk = result.kind === 'ok'
        return c.json(body, isOk ? 200 : 503, {
            'Cache-Control': isOk ? CACHE_CONTROL : 'no-store',
        })
    })

    app.get('/badge.svg', async c => {
        const svg = renderBadge(
            getBadgeContent(await loadStatus(), c.req.query('monitor') ?? null)
        )
        return c.body(svg, 200, {
            'Cache-Control': CACHE_CONTROL,
            'Content-Type': 'image/svg+xml; charset=utf-8',
        })
    })

    app.get('/feed.xml', async c => {
        const config = getConfig()
        const result = await loadStatus()
        const xml = renderFeed({
            data: result.kind === 'ok' ? result.data : null,
            now: Math.floor(Date.now() / 1_000),
            siteUrl: config.url ?? new URL(c.req.url).origin,
            title: config.title,
        })
        return c.body(xml, 200, {
            'Cache-Control': CACHE_CONTROL,
            'Content-Type': 'application/atom+xml; charset=utf-8',
        })
    })

    return app
}
