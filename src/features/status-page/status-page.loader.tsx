import { Skeleton } from '@/components/ui/skeleton'

export default function StatusPageLoader() {
    return (
        <main
            aria-busy
            className="mx-auto max-w-3xl px-4 pt-14 pb-10 max-sm:pt-8">
            <Skeleton className="mb-8 h-7 w-40 bg-muted" />
            <Skeleton className="mb-10 h-18 rounded-xl bg-muted" />
            <Skeleton className="mb-4 h-32 rounded-xl bg-muted" />
            <Skeleton className="h-32 rounded-xl bg-muted" />
        </main>
    )
}
