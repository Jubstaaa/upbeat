import type { NextRequest } from 'next/server'

import { getConfig } from '@/lib/config'
import { renderFeed } from '@/lib/feed'
import { getStatus } from '@/lib/status'
import type { StatusResult } from '@/lib/status.types'

export async function GET(request: NextRequest) {
    const config = getConfig()
    const result: StatusResult = await getStatus().catch(() => ({
        kind: 'error',
    }))
    const xml = renderFeed({
        data: result.kind === 'ok' ? result.data : null,
        now: Math.floor(Date.now() / 1_000),
        siteUrl: config.url ?? request.nextUrl.origin,
        title: config.title,
    })
    return new Response(xml, {
        headers: {
            'Cache-Control': 'public, max-age=60',
            'Content-Type': 'application/atom+xml; charset=utf-8',
        },
    })
}
