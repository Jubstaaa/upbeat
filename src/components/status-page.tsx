'use client'

import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
import SummaryCard from '@/components/summary-card'
import { getDocumentTitle, getFavicon } from '@/lib/overall'

import type { StatusPageProps } from './status-page.types'
import { fetchStatus } from './status-page.utils'

const REFRESH_MS = 60_000

export default function StatusPage({
    initialData,
    logo,
    title,
}: StatusPageProps) {
    const { data } = useQuery({
        initialData,
        initialDataUpdatedAt: initialData.updatedAt * 1_000,
        queryFn: fetchStatus,
        queryKey: ['status'],
        refetchInterval: REFRESH_MS,
        staleTime: REFRESH_MS,
    })

    useEffect(() => {
        document.title = getDocumentTitle(data.overall, title)
        document
            .querySelector('link[rel="icon"]')
            ?.setAttribute('href', getFavicon(data.overall))
    }, [data.overall, title])

    return (
        <main className="mx-auto max-w-3xl px-4 pt-14 pb-10 max-sm:pt-8">
            <SiteHeader
                isStale={data.stale}
                logo={logo}
                title={title}
                updatedAt={data.updatedAt}
            />
            <SummaryCard data={data} />
            <SiteFooter />
        </main>
    )
}
