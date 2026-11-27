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

export interface UptimeBarsProps {
    days: (null | number)[]
    dayStarts: number[]
    name: string
}
