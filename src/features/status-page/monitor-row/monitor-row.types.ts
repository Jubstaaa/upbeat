import type { MonitorState, MonitorStatus } from '@/status/status.types'

export interface MonitorRowDetailsProps {
    monitor: MonitorStatus
}

export interface MonitorRowProps {
    dayStarts: number[]
    isOpen: boolean
    monitor: MonitorStatus
    onToggle: (id: string) => void
}

export interface MonitorRowPulseProps {
    state: MonitorState
}
