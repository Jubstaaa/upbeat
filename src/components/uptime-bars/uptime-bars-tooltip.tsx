import type { UptimeBarsTooltipProps } from './uptime-bars.types'

export default function UptimeBarsTooltip({
    date,
    uptime,
    x,
    y,
}: UptimeBarsTooltipProps) {
    return (
        <div
            className="pointer-events-none fixed z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-canvas"
            role="tooltip"
            style={{ left: x, top: y }}>
            <div className="font-medium">{date}</div>
            <div>{uptime}</div>
        </div>
    )
}
