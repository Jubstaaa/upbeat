import { useMemo } from 'react'

import { cn } from '@/lib/cn'
import { getOverallDetail, isAlertState, OVERALL_TITLES } from '@/lib/overall'
import type { OverallState } from '@/lib/status.types'

import Heartbeat from './heartbeat'
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
            className="relative mb-10 flex items-center gap-3.5 overflow-hidden rounded-xl border border-line bg-surface px-5.5 py-5 shadow-xs max-sm:p-4">
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
                <p className="mt-0.5 text-sm text-muted">{detail}</p>
            </div>
            <Heartbeat state={data.overall} />
        </section>
    )
}
