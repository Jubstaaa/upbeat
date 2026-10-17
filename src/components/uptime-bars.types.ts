export interface UptimeBarsProps {
    days: (number | null)[]
    dayStarts: number[]
    name: string
}

export interface HoveredBar {
    index: number
    x: number
    y: number
}
