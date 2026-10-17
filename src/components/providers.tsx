'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'

import type { ProvidersProps } from './providers.types'

export default function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </QueryClientProvider>
    )
}
