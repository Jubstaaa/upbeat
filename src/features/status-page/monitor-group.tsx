import type { MonitorGroup } from '@/status/status.types'

import MonitorRow from '@/features/status-page/monitor-row/monitor-row'

interface MonitorGroupProps {
    dayStarts: number[]
    group: MonitorGroup
    onToggle: (id: string) => void
    openId: string
}

export default function MonitorGroup({
    dayStarts,
    group,
    onToggle,
    openId,
}: MonitorGroupProps) {
    return (
        <section className="mb-12">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {group.name ?? 'Services'}
            </h2>
            <ul className="rounded-xl border border-border bg-card shadow-xs">
                {group.monitors.map(monitor => (
                    <MonitorRow
                        dayStarts={dayStarts}
                        isOpen={openId === monitor.id}
                        key={monitor.id}
                        monitor={monitor}
                        onToggle={onToggle}
                    />
                ))}
            </ul>
        </section>
    )
}
