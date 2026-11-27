import { scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'

import type { ResponseTime } from '@/status/status.types'

const INSET = 2

export function buildSparkline(
    points: ResponseTime[],
    width: number,
    height: number
): string {
    const first = points[0]
    const last = points[points.length - 1]
    if (points.length < 2 || !first || !last) return ''
    const values = points.map(point => point.ms)
    const x = scaleLinear().domain([first.at, last.at]).range([0, width])
    const y = scaleLinear()
        .domain([Math.min(...values), Math.max(...values)])
        .range([height - INSET, INSET])
    return (
        line<ResponseTime>()
            .x(point => x(point.at))
            .y(point => y(point.ms))(points) ?? ''
    )
}
