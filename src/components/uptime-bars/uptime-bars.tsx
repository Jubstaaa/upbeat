import { useCallback, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { dayTone } from '@/lib/format/format'
import type { DayTone } from '@/lib/status/status.types'
import { cn } from '@/lib/utils/utils'

import UptimeBarsDay from './uptime-bars-day'
import type { ActiveBar, UptimeBarsProps } from './uptime-bars.types'
import { toActiveBar } from './uptime-bars.utils'

const MOBILE_DAYS = 30

const TONES: Record<DayTone, string> = {
    down: 'bg-down',
    none: 'bg-muted',
    up: 'bg-up',
    warn: 'bg-warn',
}

export default function UptimeBars({ days, dayStarts, name }: UptimeBarsProps) {
    const barsRef = useRef<HTMLDivElement>(null)

    const [active, setActive] = useState<ActiveBar | null>(null)

    const handleHover = useCallback((event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch') return
        const bar = toActiveBar(event.target, false)
        if (bar) setActive(bar)
    }, [])

    const handlePress = useCallback((event: PointerEvent<HTMLDivElement>) => {
        const bar = toActiveBar(event.target, event.pointerType === 'touch')
        if (bar) setActive(bar)
    }, [])

    const handleLeave = useCallback((event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== 'touch') setActive(null)
    }, [])

    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (!isOpen) setActive(null)
    }, [])

    const handlePointerDownOutside = useCallback((event: Event) => {
        if (barsRef.current?.contains(event.target as Node))
            event.preventDefault()
    }, [])

    const handleOpenAutoFocus = useCallback(
        (event: Event) => event.preventDefault(),
        []
    )

    const anchor = active && (
        <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0"
            style={{ left: active.left, width: active.width }}
        />
    )
    const day = active && (
        <UptimeBarsDay
            dayStart={dayStarts[active.index]}
            value={days[active.index]}
        />
    )

    return (
        <div>
            <div
                ref={barsRef}
                aria-label={`${name}, daily uptime for the last 90 days`}
                className="relative grid h-7.5 animate-reveal grid-cols-[repeat(90,minmax(0,1fr))] gap-0.5 max-sm:grid-cols-[repeat(30,minmax(0,1fr))] max-sm:gap-1"
                role="img"
                onPointerDown={handlePress}
                onPointerLeave={handleLeave}
                onPointerMove={handleHover}>
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
                {active?.isTouch && (
                    <Popover
                        key={active.index}
                        open
                        onOpenChange={handleOpenChange}>
                        <PopoverAnchor asChild>{anchor}</PopoverAnchor>
                        <PopoverContent
                            className="w-fit border-0 bg-foreground px-3 py-1.5 text-xs text-background"
                            side="top"
                            onOpenAutoFocus={handleOpenAutoFocus}
                            onPointerDownOutside={handlePointerDownOutside}>
                            {day}
                        </PopoverContent>
                    </Popover>
                )}
                {active && !active.isTouch && (
                    <Tooltip key={active.index} open>
                        <TooltipTrigger asChild>{anchor}</TooltipTrigger>
                        <TooltipContent>{day}</TooltipContent>
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
