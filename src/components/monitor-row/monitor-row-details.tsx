import ResponseSparkline from '@/components/response-sparkline/response-sparkline'
import { formatDateTime, formatOutageDuration } from '@/lib/format/format'
import { cn } from '@/lib/utils/utils'

import type { MonitorRowDetailsProps } from './monitor-row.types'

export default function MonitorRowDetails({ monitor }: MonitorRowDetailsProps) {
    return (
        <div className="pt-5">
            <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                    Response time, last 24 hours
                </span>
                {monitor.averageResponseTime !== null && (
                    <span className="font-mono">
                        {monitor.averageResponseTime} ms avg
                    </span>
                )}
            </div>
            {monitor.responseTimes.length > 1 ? (
                <ResponseSparkline
                    className="text-up"
                    points={monitor.responseTimes}
                    size="large"
                />
            ) : (
                <p className="text-sm text-muted-foreground">
                    No response times recorded yet.
                </p>
            )}
            <h3 className="mt-5 mb-2 text-sm text-muted-foreground">
                Outages, last 90 days
            </h3>
            {monitor.outages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No outages in the last 90 days.
                </p>
            ) : (
                <ul className="divide-y divide-border text-sm">
                    {monitor.outages.map(outage => (
                        <li
                            key={outage.start}
                            className="flex justify-between gap-4 py-2">
                            <span>{formatDateTime(outage.start)}</span>
                            <span
                                className={cn(
                                    'font-mono',
                                    outage.end === null
                                        ? 'text-down'
                                        : 'text-muted-foreground'
                                )}>
                                {formatOutageDuration(outage)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
