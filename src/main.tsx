import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'

import StatusPage from '@/features/status-page/status-page'
import Providers from '@/providers/providers'

import './styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('No #root element')

createRoot(root).render(
    <StrictMode>
        <Providers>
            <StatusPage />
        </Providers>
    </StrictMode>
)
