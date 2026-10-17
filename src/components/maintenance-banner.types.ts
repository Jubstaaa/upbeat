import type { MaintenanceWindow } from '@/lib/status.types'

export interface MaintenanceBannerProps {
    at: number
    windows: MaintenanceWindow[]
}
