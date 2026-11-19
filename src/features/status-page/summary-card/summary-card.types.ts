import type { OverallState, StatusData } from '@/status/status.types'

export interface SummaryCardProps {
    data: StatusData
}

export interface SummaryCardHeartbeatProps {
    state: OverallState
}
