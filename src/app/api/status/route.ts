import { NextResponse } from 'next/server'

import { getStatus } from '@/lib/status/status'

export async function GET() {
    const result = await getStatus()
    if (result.kind !== 'ok') {
        return NextResponse.json(
            { error: 'Status data is unavailable right now' },
            { status: 502 }
        )
    }
    return NextResponse.json(result.data, {
        headers: { 'Cache-Control': 'no-store' },
    })
}
