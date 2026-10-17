import { getRequestListener } from '@hono/node-server'

import { getConfig } from '@/lib/config/config'
import { getStatus } from '@/lib/status/status'

import { createApp } from './server'

export default getRequestListener(createApp({ getConfig, getStatus }).fetch)
