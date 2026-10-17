import type { MonitorGroupProps } from './monitor-group.types'
import MonitorRow from './monitor-row'

export default function MonitorGroup({
    dayStarts,
    group,
    openId,
    onToggle,
}: MonitorGroupProps) {
    return (
        <section className="mb-12">
            <h2 className="mb-3 text-sm font-medium text-muted">
                {group.name ?? 'Services'}
            </h2>
            <ul className="rounded-xl border border-line bg-surface shadow-xs">
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
