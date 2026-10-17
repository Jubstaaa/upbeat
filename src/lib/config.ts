import { z } from 'zod'

import type { SiteConfig } from './config.types'

const DEFAULT_TITLE = 'Status'
const DEFAULT_DESCRIPTION = 'Live status and uptime.'

const hexColor = z.string().regex(/^#(?:[0-9a-f]{3}){1,2}$/i)
const httpUrl = z.url({ protocol: /^https?$/ })
const logoSource = z.union([httpUrl, z.string().startsWith('/')])

function readText(value: string | undefined): string | null {
    return value?.trim() || null
}

function readValid(
    name: string,
    value: string | undefined,
    schema: z.ZodType<string>
): string | null {
    const text = readText(value)
    if (!text) return null
    const result = schema.safeParse(text)
    if (result.success) return result.data
    console.error(`upbeat: ${name} is not valid and was ignored`)
    return null
}

export function readConfig(
    env: Record<string, string | undefined>
): SiteConfig {
    return {
        accentColor: readValid('ACCENT_COLOR', env.ACCENT_COLOR, hexColor),
        apiKey: readText(env.UPTIMEROBOT_API_KEY),
        demo: readText(env.DEMO)?.toLowerCase() === 'true',
        description: readText(env.SITE_DESCRIPTION) ?? DEFAULT_DESCRIPTION,
        logo: readValid('SITE_LOGO', env.SITE_LOGO, logoSource),
        title: readText(env.SITE_TITLE) ?? DEFAULT_TITLE,
        url:
            readValid('SITE_URL', env.SITE_URL, httpUrl)?.replace(/\/+$/, '') ??
            null,
    }
}

let config: SiteConfig | undefined

export function getConfig(): SiteConfig {
    config ??= readConfig(process.env)
    return config
}
