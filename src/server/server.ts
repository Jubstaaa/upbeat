import { Hono } from 'hono'
import { cache } from 'hono/cache'
import { secureHeaders } from 'hono/secure-headers'
import { validator } from 'hono/validator'
import { z } from 'zod'

import { getBadgeContent, renderBadge } from '@/server/badge/badge'
import type { SiteConfig } from '@/server/config/config.types'
import { renderFeed } from '@/server/feed/feed'
import type { StatusResponse, StatusResult } from '@/status/status.types'

interface ServerDeps {
    getConfig: () => SiteConfig
    getStatus: () => Promise<StatusResult>
}

const CACHE_CONTROL = 'public, max-age=60'
const CACHED_ROUTES = ['/api/status', '/badge.svg', '/feed.xml']
const MONITOR_ID_MAX = 100

const badgeQuery = z.object({
    monitor: z
        .string()
        .max(MONITOR_ID_MAX)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
})

// Keep in step with public/_headers, which covers the static files; a test
// compares the two.
const SECURITY_HEADERS = secureHeaders({
    contentSecurityPolicy: {
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        defaultSrc: ["'self'"],
        // Vite inlines the smallest font subsets as data: URLs.
        fontSrc: ["'self'", 'data:'],
        formAction: ["'self'"],
        // SITE_LOGO may point at any https host.
        imgSrc: ["'self'", 'data:', 'https:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
    },
    // Badges are embedded as images on other sites.
    crossOriginResourcePolicy: 'cross-origin',
    permissionsPolicy: {
        camera: [],
        geolocation: [],
        microphone: [],
        payment: [],
        usb: [],
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    // Template deployments may share a parent domain with plain-HTTP hosts.
    strictTransportSecurity: 'max-age=31536000',
    // A read-only status page has nothing to clickjack, and embedding it is
    // a legitimate use.
    xFrameOptions: false,
})

export function createApp({ getConfig, getStatus }: ServerDeps): Hono {
    const app = new Hono()

    const loadStatus = (): Promise<StatusResult> =>
        getStatus().catch((error: unknown) => {
            console.error(
                `upbeat: could not build the status (${error instanceof Error ? error.message : String(error)})`
            )
            return { kind: 'error' }
        })

    app.use(SECURITY_HEADERS)

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

    app.get(
        '/badge.svg',
        validator('query', (value, c) => {
            const parsed = badgeQuery.safeParse(value)
            return parsed.success
                ? parsed.data
                : c.text('Invalid monitor id', 400)
        }),
        async c => {
            const { monitor } = c.req.valid('query')
            const svg = renderBadge(
                getBadgeContent(await loadStatus(), monitor ?? null)
            )
            return c.body(svg, 200, {
                'Cache-Control': CACHE_CONTROL,
                'Content-Type': 'image/svg+xml; charset=utf-8',
            })
        }
    )

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
