import { useCallback, useState } from 'react'
import type { PointerEvent } from 'react'

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { dayTone, formatDay, formatPercent } from '@/lib/format/format'
import type { DayTone } from '@/lib/status/status.types'
import { cn } from '@/lib/utils/utils'

import type { HoveredBar, UptimeBarsProps } from './uptime-bars.types'

const MOBILE_DAYS = 30

const TONES: Record<DayTone, string> = {
    down: 'bg-down',
    none: 'bg-muted',
    up: 'bg-up',
    warn: 'bg-warn',
}

export default function UptimeBars({ days, dayStarts, name }: UptimeBarsProps) {
    const [hovered, setHovered] = useState<HoveredBar | null>(null)

    const hoveredValue = hovered ? days[hovered.index] : null

    const handlePointer = useCallback((event: PointerEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        if (target.dataset.index === undefined) return
        setHovered({
            index: Number(target.dataset.index),
            left: target.offsetLeft,
            width: target.offsetWidth,
        })
    }, [])

    const handleLeave = useCallback(() => setHovered(null), [])

    return (
        <div>
            <div
                aria-label={`${name}, daily uptime for the last 90 days`}
                className="relative grid h-7.5 animate-reveal grid-cols-[repeat(90,minmax(0,1fr))] gap-0.5 max-sm:grid-cols-[repeat(30,minmax(0,1fr))] max-sm:gap-1"
                role="img"
                onPointerDown={handlePointer}
                onPointerLeave={handleLeave}
                onPointerMove={handlePointer}>
                {days.map((value, index) => (
                    <span
                        key={index}
                        data-index={index}
                        className={cn(
                            'rounded-xs transition-opacity hover:opacity-60',
                            TONES[dayTone(value)],
                            index < days.length - MOBILE_DAYS && 'max-sm:hidden'
                        )}
                    />
                ))}
                {hovered && (
                    <Tooltip key={hovered.index} open>
                        <TooltipTrigger asChild>
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-y-0"
                                style={{
                                    left: hovered.left,
                                    width: hovered.width,
                                }}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="font-medium">
                                {formatDay(dayStarts[hovered.index])}
                            </div>
                            <div>
                                {hoveredValue === null
                                    ? 'No data'
                                    : `${formatPercent(hoveredValue)} uptime`}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
            <div className="mt-2 flex justify-between text-xs text-faint">
                <span className="max-sm:hidden">90 days ago</span>
                <span className="sm:hidden">30 days ago</span>
                <span>Today</span>
            </div>
        </div>
    )
}
