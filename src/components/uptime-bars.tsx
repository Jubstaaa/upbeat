import { useCallback, useState } from 'react'
import type { PointerEvent } from 'react'

import { cn } from '@/lib/cn'
import { dayTone, formatDay, formatPercent } from '@/lib/format'
import type { DayTone } from '@/lib/status.types'

import BarTooltip from './bar-tooltip'
import type { HoveredBar, UptimeBarsProps } from './uptime-bars.types'

const MOBILE_DAYS = 30
const TOOLTIP_MARGIN = 72

const TONES: Record<DayTone, string> = {
    down: 'bg-down',
    none: 'bg-empty',
    up: 'bg-up',
    warn: 'bg-warn',
}

export default function UptimeBars({ days, dayStarts, name }: UptimeBarsProps) {
    const [hovered, setHovered] = useState<HoveredBar | null>(null)

    const hoveredValue = hovered ? days[hovered.index] : null

    const handlePointer = useCallback((event: PointerEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        if (target.dataset.index === undefined) {
            setHovered(null)
            return
        }
        const rect = target.getBoundingClientRect()
        const x = Math.min(
            Math.max(rect.left + rect.width / 2, TOOLTIP_MARGIN),
            window.innerWidth - TOOLTIP_MARGIN
        )
        setHovered({ index: Number(target.dataset.index), x, y: rect.top })
    }, [])

    const handleLeave = useCallback(() => setHovered(null), [])

    return (
        <div>
            <div
                aria-label={`${name}, daily uptime for the last 90 days`}
                className="grid h-7.5 grid-cols-[repeat(90,minmax(0,1fr))] gap-0.5 max-sm:grid-cols-[repeat(30,minmax(0,1fr))] max-sm:gap-1"
                role="img"
                onPointerDown={handlePointer}
                onPointerLeave={handleLeave}
                onPointerMove={handlePointer}>
                {days.map((value, index) => (
                    <span
                        key={index}
                        data-index={index}
                        style={{ animationDelay: `${index * 6}ms` }}
                        className={cn(
                            'origin-bottom animate-rise rounded-xs transition-opacity hover:opacity-60',
                            TONES[dayTone(value)],
                            index < days.length - MOBILE_DAYS && 'max-sm:hidden'
                        )}
                    />
                ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-faint">
                <span className="max-sm:hidden">90 days ago</span>
                <span className="sm:hidden">30 days ago</span>
                <span>Today</span>
            </div>
            {hovered && (
                <BarTooltip
                    date={formatDay(dayStarts[hovered.index])}
                    x={hovered.x}
                    y={hovered.y}
                    uptime={
                        hoveredValue === null
                            ? 'No data'
                            : `${formatPercent(hoveredValue)} uptime`
                    }
                />
            )}
        </div>
    )
}
