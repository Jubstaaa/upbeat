'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig, useReducedMotion } from 'motion/react'

import type { ProvidersProps } from './providers.types'

const EASE = { duration: 0.25, ease: [0.2, 0.8, 0.2, 1] } as const
const INSTANT = { duration: 0 }

export default function Providers({ children }: ProvidersProps) {
    const shouldReduceMotion = useReducedMotion()

    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <MotionConfig
                reducedMotion="user"
                transition={shouldReduceMotion ? INSTANT : EASE}>
                {children}
            </MotionConfig>
        </QueryClientProvider>
    )
}
