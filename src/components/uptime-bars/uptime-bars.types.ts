export interface UptimeBarsProps {
    days: (number | null)[]
    dayStarts: number[]
    name: string
}

export interface UptimeBarsTooltipProps {
    date: string
    uptime: string
    x: number
    y: number
}

export interface HoveredBar {
    index: number
    x: number
    y: number
}
