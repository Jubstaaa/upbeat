import { serveStatic } from '@hono/bun'
import { Hono } from 'hono'

import { getConfig } from '@/server/config/config'
import { getStatus } from '@/server/status/status'

import { matchesHeaderPath, parseHeadersFile } from './headers-file'
import { createApp } from './server'

const CLIENT_DIR = './dist/client'

const headerRules = parseHeadersFile(
    await Bun.file(`${CLIENT_DIR}/_headers`).text()
)

const app = new Hono()
app.use(async (c, next) => {
    await next()
    for (const rule of headerRules)
        if (matchesHeaderPath(rule.path, c.req.path))
            for (const [name, value] of Object.entries(rule.headers))
                c.header(name, value)
})
app.route('/', createApp({ getConfig, getStatus }))
app.use('*', serveStatic({ root: CLIENT_DIR }))
app.get('*', serveStatic({ path: `${CLIENT_DIR}/index.html` }))

export default { fetch: app.fetch, port: Number(process.env.PORT ?? 3000) }
