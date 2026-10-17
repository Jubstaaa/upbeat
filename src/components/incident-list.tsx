import { cn } from '@/lib/cn'
import {
    formatDateTime,
    formatIncidentTitle,
    formatOutageDuration,
} from '@/lib/format'

import type { IncidentListProps } from './incident-list.types'

export default function IncidentList({ incidents }: IncidentListProps) {
    return (
        <section>
            <h2 className="mb-3 text-sm font-medium text-muted">
                Recent incidents
            </h2>
            {incidents.length === 0 ? (
                <p className="border-y border-line py-3.5 text-sm text-muted">
                    No incidents in the last 90 days.
                </p>
            ) : (
                <ul>
                    {incidents.map(incident => (
                        <li
                            key={incident.start}
                            className="flex gap-4 border-t border-line py-3.5 last:border-b max-sm:flex-col max-sm:gap-0.5">
                            <time
                                className="w-32 flex-none text-sm text-muted"
                                dateTime={new Date(
                                    incident.start * 1_000
                                ).toISOString()}>
                                {formatDateTime(incident.start)}
                            </time>
                            <div className="min-w-0">
                                <div
                                    className={cn(
                                        'font-medium',
                                        incident.end === null && 'text-down'
                                    )}>
                                    {formatIncidentTitle(incident)}
                                </div>
                                <div className="text-sm wrap-anywhere text-muted">
                                    {incident.monitors.join(', ')} ·{' '}
                                    {formatOutageDuration(incident)}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
