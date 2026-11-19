export interface UptimeBarsProps {
    days: (number | null)[]
    dayStarts: number[]
    name: string
}

export interface ActiveBar {
    index: number
    isTouch: boolean
    left: number
    width: number
}

export interface UptimeBarsDayProps {
    dayStart: number
    value: null | number
}
