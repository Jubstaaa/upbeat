import { motion } from 'motion/react'

import { formatDateTime } from '@/lib/format/format'

import type { MaintenanceBannerProps } from './maintenance-banner.types'

const HIDDEN = { opacity: 0, y: -8 }
const SHOWN = { opacity: 1, y: 0 }

export default function MaintenanceBanner({
    at,
    windows,
}: MaintenanceBannerProps) {
    const next = windows[0]

    if (!next) return null

    const isActive = next.start <= at && at < next.end

    return (
        <motion.div
            animate={SHOWN}
            className="mb-6 rounded-xl border border-maintenance/30 bg-maintenance/10 px-5 py-4 text-sm"
            initial={HIDDEN}
            role="status">
            <div className="font-medium text-maintenance">
                {isActive ? 'Maintenance in progress' : 'Scheduled maintenance'}
            </div>
            <div className="text-muted">
                {next.name} · {formatDateTime(next.start)} –{' '}
                {formatDateTime(next.end)}
            </div>
        </motion.div>
    )
}
