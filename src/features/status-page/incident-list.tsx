import { cn } from '@/lib/utils'
import {
    formatDateTime,
    formatIncidentTitle,
    formatOutageDuration,
} from '@/status/format'
import type { Incident } from '@/status/status.types'

interface IncidentListProps {
    incidents: Incident[]
}

export default function IncidentList({ incidents }: IncidentListProps) {
    return (
        <section>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Recent incidents
            </h2>
            {incidents.length === 0 ? (
                <p className="border-y border-border py-3.5 text-sm text-muted-foreground">
                    No incidents in the last 90 days.
                </p>
            ) : (
                <ul>
                    {incidents.map(incident => (
                        <li
                            key={incident.start}
                            className="flex gap-4 border-t border-border py-3.5 last:border-b max-sm:flex-col max-sm:gap-0.5">
                            <time
                                className="w-32 flex-none text-sm text-muted-foreground"
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
                                <div className="text-sm wrap-anywhere text-muted-foreground">
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
