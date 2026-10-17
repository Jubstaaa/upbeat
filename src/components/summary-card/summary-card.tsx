import { useMemo } from 'react'

import {
    getOverallDetail,
    isAlertState,
    OVERALL_TITLES,
} from '@/lib/overall/overall'
import type { OverallState } from '@/lib/status/status.types'
import { cn } from '@/lib/utils/utils'

import SummaryCardHeartbeat from './summary-card-heartbeat'
import type { SummaryCardProps } from './summary-card.types'

const DOTS: Record<OverallState, string> = {
    degraded: 'bg-down',
    maintenance: 'bg-maintenance',
    operational: 'bg-up',
    outage: 'bg-down',
}

export default function SummaryCard({ data }: SummaryCardProps) {
    const detail = useMemo(() => getOverallDetail(data), [data])
    const speed = isAlertState(data.overall) && '[animation-duration:0.9s]'

    return (
        <section
            aria-live="polite"
            className="relative mb-10 flex items-center gap-3.5 overflow-hidden rounded-xl border border-border bg-card px-5.5 py-5 shadow-xs max-sm:p-4">
            <span
                className={cn(
                    'relative size-3 flex-none animate-beat rounded-full',
                    DOTS[data.overall],
                    speed
                )}>
                <span
                    className={cn(
                        'absolute inset-0 animate-ring rounded-full',
                        DOTS[data.overall],
                        speed
                    )}
                />
            </span>
            <div className="relative z-10 min-w-0">
                <h1 className="text-lg font-semibold tracking-tight">
                    {OVERALL_TITLES[data.overall]}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
            </div>
            <SummaryCardHeartbeat state={data.overall} />
        </section>
    )
}
