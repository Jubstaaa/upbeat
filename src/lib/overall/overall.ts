import { formatDateTime } from '@/lib/format/format'
import type { OverallState, StatusData } from '@/lib/status/status.types'

export const OVERALL_TITLES: Record<OverallState, string> = {
    degraded: 'Partial outage',
    maintenance: 'Under maintenance',
    operational: 'All systems operational',
    outage: 'Major outage',
}

export const OVERALL_COLORS: Record<OverallState, string> = {
    degraded: '#e2a03f',
    maintenance: '#3e8ef7',
    operational: '#22a06b',
    outage: '#e5484d',
}

export const UNKNOWN_COLOR = '#9f9f9f'

export function isAlertState(state: OverallState): boolean {
    return state === 'degraded' || state === 'outage'
}

export function getOverallDetail(data: StatusData): string {
    if (data.overall === 'maintenance') {
        const active = data.maintenance.find(
            window =>
                window.start <= data.updatedAt && data.updatedAt < window.end
        )
        return active
            ? `${active.name} until ${formatDateTime(active.end)}`
            : 'Scheduled maintenance in progress'
    }
    const watched = data.groups
        .flatMap(group => group.monitors)
        .filter(monitor => monitor.state !== 'paused')
    if (watched.length === 0) return 'No monitors are being checked yet'
    const down = watched.filter(monitor => monitor.state === 'down').length
    if (down > 0)
        return `${down} of ${watched.length} services ${down === 1 ? 'is' : 'are'} down`
    return watched.length === 1
        ? 'The service is up'
        : `All ${watched.length} services are up`
}

export function getDocumentTitle(
    state: OverallState,
    siteTitle: string
): string {
    return state === 'operational'
        ? siteTitle
        : `${OVERALL_TITLES[state]} · ${siteTitle}`
}

export function getFavicon(state: OverallState | null): string {
    const color = state ? OVERALL_COLORS[state] : UNKNOWN_COLOR
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='6' fill='${color}'/></svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
