'use client'

import { useCallback, useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import IncidentList from '@/components/incident-list'
import MaintenanceBanner from '@/components/maintenance-banner'
import MonitorGroup from '@/components/monitor-group'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
import SummaryCard from '@/components/summary-card'
import { getDocumentTitle, getFavicon } from '@/lib/overall'

import { useLocationHash } from './status-page.hooks'
import type { StatusPageProps } from './status-page.types'
import { fetchStatus } from './status-page.utils'

const REFRESH_MS = 60_000

export default function StatusPage({
    initialData,
    logo,
    title,
}: StatusPageProps) {
    const [openId, setOpenId] = useLocationHash()

    const { data } = useQuery({
        initialData,
        initialDataUpdatedAt: initialData.updatedAt * 1_000,
        queryFn: fetchStatus,
        queryKey: ['status'],
        refetchInterval: REFRESH_MS,
        staleTime: REFRESH_MS,
    })

    const hasMonitors = useMemo(
        () => data.groups.some(group => group.monitors.length > 0),
        [data.groups]
    )

    const handleToggle = useCallback(
        (id: string) => setOpenId(openId === id ? '' : id),
        [openId, setOpenId]
    )

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
            <MaintenanceBanner at={data.updatedAt} windows={data.maintenance} />
            <SummaryCard data={data} />
            {hasMonitors ? (
                data.groups.map(group => (
                    <MonitorGroup
                        key={group.name ?? ''}
                        dayStarts={data.dayStarts}
                        group={group}
                        openId={openId}
                        onToggle={handleToggle}
                    />
                ))
            ) : (
                <p className="mb-12 rounded-xl border border-line bg-surface px-5.5 py-5 text-sm text-muted">
                    No monitors yet. Add one in UptimeRobot and it will appear
                    here.
                </p>
            )}
            <IncidentList incidents={data.incidents} />
            <SiteFooter />
        </main>
    )
}
