import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'

import { formatAgo } from '@/lib/format'

import type { SiteHeaderProps } from './site-header.types'

const TICK_MS = 15_000

export default function SiteHeader({
    isStale,
    logo,
    title,
    updatedAt,
}: SiteHeaderProps) {
    const [now, setNow] = useState(updatedAt * 1_000)

    const ago = useMemo(
        () => formatAgo(Math.max(0, Math.floor(now / 1_000) - updatedAt)),
        [now, updatedAt]
    )

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), TICK_MS)
        return () => clearInterval(timer)
    }, [])

    return (
        <header className="mb-8 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
                {logo && (
                    <Image
                        unoptimized
                        alt=""
                        className="size-7 rounded-md"
                        height={28}
                        src={logo}
                        width={28}
                    />
                )}
                <span className="truncate text-lg font-semibold tracking-tight">
                    {title}
                </span>
            </div>
            <div className="flex flex-none flex-col items-end text-sm text-muted">
                <span>Updated {ago}</span>
                {isStale && (
                    <span className="text-xs text-warn">
                        Data may be out of date
                    </span>
                )}
            </div>
        </header>
    )
}
