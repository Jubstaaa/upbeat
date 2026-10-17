import type { ResponseTime } from '@/lib/status.types'

const INSET = 2

function round(value: number): number {
    return Math.round(value * 10) / 10
}

export function buildSparkline(
    points: ResponseTime[],
    width: number,
    height: number
): string {
    if (points.length < 2) return ''
    const values = points.map(point => point.ms)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const first = points[0].at
    const span = points[points.length - 1].at - first || 1
    const toY = (ms: number) =>
        max === min
            ? height / 2
            : height - INSET - ((ms - min) / (max - min)) * (height - INSET * 2)

    return points
        .map(
            (point, index) =>
                `${index === 0 ? 'M' : 'L'}${round(((point.at - first) / span) * width)} ${round(toY(point.ms))}`
        )
        .join(' ')
}
