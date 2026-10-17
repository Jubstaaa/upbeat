import type { SiteConfig } from '@/lib/config/config.types'
import type { StatusResult } from '@/lib/status/status.types'

export interface ServerDeps {
    getConfig: () => SiteConfig
    getStatus: () => Promise<StatusResult>
}

export interface SiteInfo {
    accentColor: string | null
    description: string
    logo: string | null
    title: string
}

export interface StatusResponse {
    result: StatusResult
    site: SiteInfo
}
