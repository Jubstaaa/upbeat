import type { ResponseTime } from '@/lib/status/status.types'

export interface ResponseSparklineProps {
    className?: string
    points: ResponseTime[]
    size?: 'large' | 'small'
}
