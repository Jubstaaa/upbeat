import type { NextRequest } from 'next/server'

import { getBadgeContent, renderBadge } from '@/lib/badge/badge'
import { getStatus } from '@/lib/status/status'
import type { StatusResult } from '@/lib/status/status.types'

export async function GET(request: NextRequest) {
    const result: StatusResult = await getStatus().catch(() => ({
        kind: 'error',
    }))
    const svg = renderBadge(
        getBadgeContent(result, request.nextUrl.searchParams.get('monitor'))
    )
    return new Response(svg, {
        headers: {
            'Cache-Control': 'public, max-age=60, s-maxage=60',
            'Content-Type': 'image/svg+xml; charset=utf-8',
        },
    })
}
