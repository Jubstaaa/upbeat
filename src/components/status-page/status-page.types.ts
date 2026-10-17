import type { StatusData } from '@/lib/status/status.types'

export interface StatusPageProps {
    initialData: StatusData
    logo: string | null
    title: string
}

export type HashSetter = (value: string) => void
