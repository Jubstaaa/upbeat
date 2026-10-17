import { Button } from '@/components/ui/button'

import type { ErrorScreenProps } from './error-screen.types'

export default function ErrorScreen({ onRetry }: ErrorScreenProps) {
    return (
        <main className="mx-auto max-w-xl px-4 py-16">
            <h1 className="text-2xl font-semibold tracking-tight">
                Status is unavailable
            </h1>
            <p className="mt-2 text-muted-foreground">
                We could not reach UptimeRobot just now. This is usually brief.
            </p>
            <Button className="mt-6" variant="outline" onClick={onRetry}>
                Try again
            </Button>
        </main>
    )
}
