import { getConfig } from '@/server/config/config'
import { getStatus } from '@/server/status/status'

import { createApp } from './server'

export default createApp({ getConfig, getStatus })
