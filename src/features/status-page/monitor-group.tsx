import MonitorRow from '@/features/status-page/monitor-row/monitor-row'
import type { MonitorGroup } from '@/status/status.types'

interface MonitorGroupProps {
    dayStarts: number[]
    group: MonitorGroup
    openId: string
    onToggle: (id: string) => void
}

export default function MonitorGroup({
    dayStarts,
    group,
    openId,
    onToggle,
}: MonitorGroupProps) {
    return (
        <section className="mb-12">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {group.name ?? 'Services'}
            </h2>
            <ul className="rounded-xl border border-border bg-card shadow-xs">
                {group.monitors.map(monitor => (
                    <MonitorRow
                        key={monitor.id}
                        dayStarts={dayStarts}
                        isOpen={openId === monitor.id}
                        monitor={monitor}
                        onToggle={onToggle}
                    />
                ))}
            </ul>
        </section>
    )
}
