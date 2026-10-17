import { formatDay, formatPercent } from '@/lib/format/format'

import type { UptimeBarsDayProps } from './uptime-bars.types'

export default function UptimeBarsDay({ dayStart, value }: UptimeBarsDayProps) {
    return (
        <>
            <div className="font-medium">{formatDay(dayStart)}</div>
            <div>
                {value === null ? 'No data' : `${formatPercent(value)} uptime`}
            </div>
        </>
    )
}
