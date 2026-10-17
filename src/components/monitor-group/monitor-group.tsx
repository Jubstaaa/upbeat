import MonitorRow from '@/components/monitor-row/monitor-row'

import type { MonitorGroupProps } from './monitor-group.types'

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
