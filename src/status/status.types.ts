export type DayTone = 'down' | 'none' | 'up' | 'warn'

export interface Incident {
    end: null | number
    monitors: string[]
    ongoing: string[]
    start: number
}

export interface MaintenanceWindow {
    end: number
    name: string
    start: number
}

export interface MonitorGroup {
    monitors: MonitorStatus[]
    name: null | string
}

export type MonitorState = 'down' | 'paused' | 'pending' | 'up'

export interface MonitorStatus {
    averageResponseTime: null | number
    days: (null | number)[]
    id: string
    name: string
    outages: Outage[]
    responseTimes: ResponseTime[]
    state: MonitorState
    uptime: null | number
}

export interface Outage {
    end: null | number
    start: number
}

export type OverallState = 'degraded' | 'maintenance' | 'operational' | 'outage'

export interface ResponseTime {
    at: number
    ms: number
}

export interface SiteInfo {
    accentColor: null | string
    description: string
    logo: null | string
    title: string
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

export interface StatusResponse {
    result: StatusResult
    site: SiteInfo
}

export type StatusResult =
    { data: StatusData; kind: 'ok' } | { kind: 'error' } | { kind: 'setup' }
