import { getRequestListener } from '@hono/node-server'

import { getConfig } from '@/server/config/config'
import { getStatus } from '@/server/status/status'

import { createApp } from './server'

export default getRequestListener(createApp({ getConfig, getStatus }).fetch)
