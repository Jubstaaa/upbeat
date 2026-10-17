import type { Metadata } from 'next'

import { connection } from 'next/server'

import ErrorScreen from '@/components/error-screen/error-screen'
import SetupScreen from '@/components/setup-screen/setup-screen'
import StatusPage from '@/components/status-page/status-page'
import { getConfig } from '@/lib/config/config'
import { getDocumentTitle, getFavicon } from '@/lib/overall/overall'
import { getStatus } from '@/lib/status/status'

export async function generateMetadata(): Promise<Metadata> {
    await connection()
    const config = getConfig()
    const result = await getStatus()
    const overall = result.kind === 'ok' ? result.data.overall : null

    return {
        alternates: { types: { 'application/atom+xml': '/feed.xml' } },
        description: config.description,
        icons: { icon: getFavicon(overall) },
        title: overall ? getDocumentTitle(overall, config.title) : config.title,
    }
}

export default async function Home() {
    await connection()
    const config = getConfig()
    const result = await getStatus()

    if (result.kind === 'setup') return <SetupScreen />
    if (result.kind === 'error') return <ErrorScreen />

    return (
        <StatusPage
            initialData={result.data}
            logo={config.logo}
            title={config.title}
        />
    )
}
