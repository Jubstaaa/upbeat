export type MonitorState = 'down' | 'paused' | 'pending' | 'up'

export type OverallState = 'degraded' | 'maintenance' | 'operational' | 'outage'

export type DayTone = 'down' | 'none' | 'up' | 'warn'

export interface ResponseTime {
    at: number
    ms: number
}

export interface Outage {
    end: number | null
    start: number
}

export interface Incident {
    end: number | null
    monitors: string[]
    ongoing: string[]
    start: number
}

export interface MaintenanceWindow {
    end: number
    name: string
    start: number
}

export interface MonitorStatus {
    id: string
    averageResponseTime: number | null
    days: (number | null)[]
    name: string
    outages: Outage[]
    responseTimes: ResponseTime[]
    state: MonitorState
    uptime: number | null
}

export interface MonitorGroup {
    monitors: MonitorStatus[]
    name: string | null
}

export interface StatusData {
    dayStarts: number[]
    groups: MonitorGroup[]
    incidents: Incident[]
    maintenance: MaintenanceWindow[]
    overall: OverallState
    stale: boolean
    updatedAt: number
}

export type StatusResult =
    { data: StatusData; kind: 'ok' } | { kind: 'error' } | { kind: 'setup' }

export interface SiteInfo {
    accentColor: string | null
    description: string
    logo: string | null
    title: string
}

export interface StatusResponse {
    result: StatusResult
    site: SiteInfo
}
