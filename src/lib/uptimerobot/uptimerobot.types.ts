export interface UptimeRobotLog {
    datetime: number
    duration: number
    type: number
}

export interface UptimeRobotResponseTime {
    datetime: number
    value: number
}

export interface UptimeRobotWindow {
    id: number
    duration: number
    friendly_name?: string
    start_time: number | string
    status: number
    type: number
}

export interface UptimeRobotMonitor {
    id: number
    average_response_time?: string
    create_datetime: number
    custom_uptime_ranges: string
    friendly_name: string
    logs?: UptimeRobotLog[]
    mwindows?: UptimeRobotWindow[]
    response_times?: UptimeRobotResponseTime[]
    status: number
}

export interface UptimeRobotError {
    message?: string
    parameter_name?: string
    type?: string
}

export interface UptimeRobotPagination {
    limit: number
    offset: number
    total: number
}

export interface UptimeRobotPage {
    error?: UptimeRobotError
    monitors?: UptimeRobotMonitor[]
    pagination?: UptimeRobotPagination
    stat: 'fail' | 'ok'
}

export interface MonitorQuery {
    logsStart: number
    now: number
    ranges: string
    responseTimesStart: number
}
