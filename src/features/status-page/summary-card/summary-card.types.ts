import type { OverallState, StatusData } from '@/status/status.types'

export interface SummaryCardHeartbeatProps {
    state: OverallState
}

export interface SummaryCardProps {
    data: StatusData
}
