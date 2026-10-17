import type { MonitorState } from '@/lib/status/status.types'
import { cn } from '@/lib/utils/utils'

import type { MonitorRowPulseProps } from './monitor-row.types'

const BEAT = 'M0 6 H8 L10 6 L12 2 L14 10 L16 6 H28'
const FLAT = 'M0 6 H28'

const STROKES: Record<MonitorState, string> = {
    down: 'stroke-down',
    paused: 'stroke-faint',
    pending: 'stroke-faint',
    up: 'stroke-up',
}

const LINE =
    'fill-none stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]'

export default function MonitorRowPulse({ state }: MonitorRowPulseProps) {
    const isUp = state === 'up'

    return (
        <svg
            aria-hidden
            viewBox="0 0 28 12"
            className={cn(
                'h-3 w-7 flex-none',
                state === 'down' && 'animate-blink'
            )}>
            <path
                className={cn(LINE, STROKES[state], isUp && 'opacity-25')}
                d={isUp ? BEAT : FLAT}
            />
            {isUp && (
                <path
                    d={BEAT}
                    className={cn(
                        LINE,
                        'animate-trace [stroke-dasharray:14_30]',
                        STROKES[state]
                    )}
                />
            )}
        </svg>
    )
}
