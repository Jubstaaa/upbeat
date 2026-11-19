import { useCallback, useSyncExternalStore } from 'react'

import { parseHash } from './status-page.utils'

type HashSetter = (value: string) => void

function subscribe(onChange: () => void): () => void {
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
}

function getSnapshot(): string {
    return parseHash(window.location.hash)
}

function getServerSnapshot(): string {
    return ''
}

export function useLocationHash(): [string, HashSetter] {
    const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    const setHash = useCallback((value: string) => {
        const { pathname, search } = window.location
        window.history.replaceState(
            null,
            '',
            value ? `#${encodeURIComponent(value)}` : `${pathname}${search}`
        )
        window.dispatchEvent(new HashChangeEvent('hashchange'))
    }, [])

    return [hash, setHash]
}
