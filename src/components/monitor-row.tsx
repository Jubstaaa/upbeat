import { useCallback, useEffect, useRef } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/cn'
import { formatPercent } from '@/lib/format'

import MonitorDetails from './monitor-details'
import type { MonitorRowProps } from './monitor-row.types'
import Pulse from './pulse'
import ResponseSparkline from './response-sparkline'
import UptimeBars from './uptime-bars'

const EXPAND = { duration: 0.25, ease: [0.2, 0.8, 0.2, 1] } as const
const CLOSED = { height: 0, opacity: 0 }
const OPEN = { height: 'auto', opacity: 1 }

export default function MonitorRow({
    dayStarts,
    isOpen,
    monitor,
    onToggle,
}: MonitorRowProps) {
    const rowRef = useRef<HTMLLIElement>(null)

    const detailsId = `${monitor.id}-details`

    const handleToggle = useCallback(
        () => onToggle(monitor.id),
        [monitor.id, onToggle]
    )

    useEffect(() => {
        if (isOpen)
            rowRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
    }, [isOpen])

    return (
        <li
            ref={rowRef}
            className="scroll-mt-4 px-5.5 py-4.5 not-first:border-t not-first:border-line max-sm:p-4"
            id={monitor.id}>
            <button
                aria-controls={detailsId}
                aria-expanded={isOpen}
                className="mb-3 flex w-full items-center gap-2.5 text-left"
                type="button"
                onClick={handleToggle}>
                <Pulse state={monitor.state} />
                <span className="min-w-0 flex-1 truncate font-medium">
                    {monitor.name}
                </span>
                {monitor.state === 'paused' && (
                    <span className="rounded-full bg-empty px-2 py-0.5 text-xs text-muted">
                        Paused
                    </span>
                )}
                <ResponseSparkline
                    className="text-faint max-sm:hidden"
                    points={monitor.responseTimes}
                />
                <span className="font-mono text-sm text-muted">
                    {formatPercent(monitor.uptime)}
                </span>
                <svg
                    aria-hidden
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className={cn(
                        'size-4 flex-none text-faint transition-transform',
                        isOpen && 'rotate-180'
                    )}>
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
            <UptimeBars
                days={monitor.days}
                dayStarts={dayStarts}
                name={monitor.name}
            />
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="details"
                        animate={OPEN}
                        className="overflow-hidden"
                        exit={CLOSED}
                        id={detailsId}
                        initial={CLOSED}
                        transition={EXPAND}>
                        <MonitorDetails monitor={monitor} />
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    )
}
