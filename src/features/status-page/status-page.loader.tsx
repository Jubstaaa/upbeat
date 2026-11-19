const BLOCK = 'animate-pulse rounded-xl bg-muted'

export default function StatusPageLoader() {
    return (
        <main
            aria-busy
            className="mx-auto max-w-3xl px-4 pt-14 pb-10 max-sm:pt-8">
            <div className="mb-8 h-7 w-40 animate-pulse rounded-md bg-muted" />
            <div className={`mb-10 h-18 ${BLOCK}`} />
            <div className={`mb-4 h-32 ${BLOCK}`} />
            <div className={`h-32 ${BLOCK}`} />
        </main>
    )
}
