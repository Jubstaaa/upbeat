import type { MaintenanceWindow } from '@/lib/status/status.types'

export interface MaintenanceBannerProps {
    at: number
    windows: MaintenanceWindow[]
}
