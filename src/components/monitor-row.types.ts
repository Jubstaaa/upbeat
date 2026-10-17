import type { MonitorStatus } from '@/lib/status.types'

export interface MonitorRowProps {
    dayStarts: number[]
    isOpen: boolean
    monitor: MonitorStatus
    onToggle: (id: string) => void
}
