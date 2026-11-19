import { useCallback, useEffect, useRef } from 'react'

import { ChevronDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import ResponseSparkline from '@/features/status-page/response-sparkline/response-sparkline'
import UptimeBars from '@/features/status-page/uptime-bars/uptime-bars'
import { cn } from '@/lib/utils'
import { formatPercent } from '@/status/format'

import MonitorRowDetails from './monitor-row-details'
import MonitorRowPulse from './monitor-row-pulse'
import type { MonitorRowProps } from './monitor-row.types'

export default function MonitorRow({
    dayStarts,
    isOpen,
    monitor,
    onToggle,
}: MonitorRowProps) {
    const rowRef = useRef<HTMLLIElement>(null)

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
        <Collapsible asChild open={isOpen} onOpenChange={handleToggle}>
            <li
                ref={rowRef}
                className="scroll-mt-4 px-5.5 py-4.5 [contain-intrinsic-size:auto_140px] [content-visibility:auto] not-first:border-t not-first:border-border max-sm:p-4"
                id={monitor.id}>
                <CollapsibleTrigger className="mb-3 flex w-full items-center gap-2.5 text-left">
                    <MonitorRowPulse state={monitor.state} />
                    <span className="min-w-0 flex-1 truncate font-medium">
                        {monitor.name}
                    </span>
                    {monitor.state === 'paused' && (
                        <Badge variant="secondary">Paused</Badge>
                    )}
                    <ResponseSparkline
                        className="text-faint max-sm:hidden"
                        points={monitor.responseTimes}
                    />
                    <span className="font-mono text-sm text-muted-foreground">
                        {formatPercent(monitor.uptime)}
                    </span>
                    <ChevronDown
                        aria-hidden
                        className={cn(
                            'size-4 flex-none text-faint transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </CollapsibleTrigger>
                <UptimeBars
                    days={monitor.days}
                    dayStarts={dayStarts}
                    name={monitor.name}
                />
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <MonitorRowDetails monitor={monitor} />
                </CollapsibleContent>
            </li>
        </Collapsible>
    )
}
