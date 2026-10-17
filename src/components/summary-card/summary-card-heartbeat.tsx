import { isAlertState } from '@/lib/overall/overall'
import type { OverallState } from '@/lib/status/status.types'
import { cn } from '@/lib/utils/utils'

import type { SummaryCardHeartbeatProps } from './summary-card.types'

const PATH =
    'M0 30 H40 L48 30 L54 20 L60 40 L66 6 L72 54 L78 30 L86 30 H140 L148 30 L154 20 L160 40 L166 6 L172 54 L178 30 L186 30 H240 L248 30 L254 20 L260 40 L266 6 L272 54 L278 30 L286 30 H300'

const STROKES: Record<OverallState, string> = {
    degraded: 'stroke-down',
    maintenance: 'stroke-maintenance',
    operational: 'stroke-up',
    outage: 'stroke-down',
}

export default function SummaryCardHeartbeat({
    state,
}: SummaryCardHeartbeatProps) {
    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5 [mask-image:linear-gradient(to_right,transparent,black_40%)] max-sm:w-1/3"
            preserveAspectRatio="xMaxYMid slice"
            viewBox="0 0 300 60">
            <path
                d={PATH}
                vectorEffect="non-scaling-stroke"
                className={cn(
                    'fill-none stroke-[1.5] opacity-15',
                    STROKES[state]
                )}
            />
            <path
                d={PATH}
                vectorEffect="non-scaling-stroke"
                className={cn(
                    'animate-ekg fill-none stroke-2 [stroke-dasharray:90_510] [stroke-linecap:round] [stroke-linejoin:round]',
                    STROKES[state],
                    isAlertState(state) && '[animation-duration:1.2s]'
                )}
            />
        </svg>
    )
}
