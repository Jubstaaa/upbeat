import { useId, useMemo } from 'react'

import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/cn'

import type { ResponseSparklineProps } from './response-sparkline.types'
import { buildSparkline } from './response-sparkline.utils'

const SIZES = {
    large: { height: 120, width: 600 },
    small: { height: 24, width: 96 },
}

const DRAW = { duration: 0.8, ease: 'easeOut' } as const

export default function ResponseSparkline({
    className,
    points,
    size = 'small',
}: ResponseSparklineProps) {
    const reactId = useId()
    const shouldReduceMotion = useReducedMotion()

    const { height, width } = SIZES[size]
    const path = useMemo(
        () => buildSparkline(points, width, height),
        [points, width, height]
    )
    const gradientId = `fill-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`

    if (!path) return null

    return (
        <svg
            aria-hidden
            preserveAspectRatio="none"
            viewBox={`0 0 ${width} ${height}`}
            className={cn(
                size === 'small' ? 'h-6 w-24' : 'h-30 w-full',
                className
            )}>
            {size === 'large' && (
                <>
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1">
                            <stop
                                offset="0"
                                stopColor="currentColor"
                                stopOpacity="0.2"
                            />
                            <stop
                                offset="1"
                                stopColor="currentColor"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d={`${path} L${width} ${height} L0 ${height} Z`}
                        fill={`url(#${gradientId})`}
                    />
                </>
            )}
            <motion.path
                animate={{ pathLength: 1 }}
                className="fill-none stroke-current stroke-[1.5]"
                d={path}
                initial={{ pathLength: 0 }}
                transition={shouldReduceMotion ? undefined : DRAW}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}
