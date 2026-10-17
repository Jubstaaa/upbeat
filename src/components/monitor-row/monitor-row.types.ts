import type { MonitorState, MonitorStatus } from '@/lib/status/status.types'

export interface MonitorRowProps {
    dayStarts: number[]
    isOpen: boolean
    monitor: MonitorStatus
    onToggle: (id: string) => void
}

export interface MonitorRowDetailsProps {
    monitor: MonitorStatus
}

export interface MonitorRowPulseProps {
    state: MonitorState
}
