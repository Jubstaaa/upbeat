import { getConfig } from '@/lib/config/config'
import { getStatus } from '@/lib/status/status'

import { createApp } from './server'

export default createApp({ getConfig, getStatus })
