import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

import { getConfig } from '@/lib/config/config'
import { getStatus } from '@/lib/status/status'

import { createApp } from './server'

const CLIENT_DIR = './dist/client'

const app = new Hono()
app.route('/', createApp({ getConfig, getStatus }))
app.use('*', serveStatic({ root: CLIENT_DIR }))
app.get('*', serveStatic({ path: `${CLIENT_DIR}/index.html` }))

export default { fetch: app.fetch, port: Number(process.env.PORT ?? 3000) }
