export interface DemoOutage {
    daysAgo: number
    hour: number
    minutes: number
}

export interface DemoMonitor {
    createdDaysAgo: number
    name: string
    outages: DemoOutage[]
    responseMs: number
}
