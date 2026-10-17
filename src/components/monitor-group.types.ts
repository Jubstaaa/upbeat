import type { MonitorGroup } from '@/lib/status.types'

export interface MonitorGroupProps {
    dayStarts: number[]
    group: MonitorGroup
    openId: string
    onToggle: (id: string) => void
}
