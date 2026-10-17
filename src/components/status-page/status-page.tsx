import { useCallback, useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import ErrorScreen from '@/components/error-screen/error-screen'
import IncidentList from '@/components/incident-list/incident-list'
import MaintenanceBanner from '@/components/maintenance-banner/maintenance-banner'
import MonitorGroup from '@/components/monitor-group/monitor-group'
import SetupScreen from '@/components/setup-screen/setup-screen'
import SiteFooter from '@/components/site-footer/site-footer'
import SiteHeader from '@/components/site-header/site-header'
import SummaryCard from '@/components/summary-card/summary-card'
import { getDocumentTitle, getFavicon } from '@/lib/overall/overall'

import { useLocationHash } from './status-page.hooks'
import StatusPageLoader from './status-page.loader'
import { fetchStatus } from './status-page.utils'

const REFRESH_MS = 60_000

export default function StatusPage() {
    const [openId, setOpenId] = useLocationHash()

    const {
        data: response,
        isPending,
        refetch,
    } = useQuery({
        queryFn: fetchStatus,
        queryKey: ['status'],
        refetchInterval: REFRESH_MS,
    })

    const site = response?.site
    const data = response?.result.kind === 'ok' ? response.result.data : null
    const hasMonitors = useMemo(
        () => Boolean(data?.groups.some(group => group.monitors.length > 0)),
        [data]
    )

    const handleToggle = useCallback(
        (id: string) => setOpenId(openId === id ? '' : id),
        [openId, setOpenId]
    )
    const handleRetry = useCallback(() => {
        void refetch()
    }, [refetch])

    useEffect(() => {
        if (!site) return
        const root = document.documentElement
        document.title = data
            ? getDocumentTitle(data.overall, site.title)
            : site.title
        document
            .querySelector('link[rel="icon"]')
            ?.setAttribute('href', getFavicon(data?.overall ?? null))
        if (site.accentColor) {
            root.dataset.accent = ''
            root.style.setProperty('--accent', site.accentColor)
        }
    }, [data, site])

    if (isPending) return <StatusPageLoader />
    if (response?.result.kind === 'setup') return <SetupScreen />
    if (!site || !data) return <ErrorScreen onRetry={handleRetry} />

    return (
        <main className="mx-auto max-w-3xl px-4 pt-14 pb-10 max-sm:pt-8">
            <SiteHeader
                isStale={data.stale}
                logo={site.logo}
                title={site.title}
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
                <p className="mb-12 rounded-xl border border-border bg-card px-5.5 py-5 text-sm text-muted-foreground">
                    No monitors yet. Add one in UptimeRobot and it will appear
                    here.
                </p>
            )}
            <IncidentList incidents={data.incidents} />
            <SiteFooter />
        </main>
    )
}
