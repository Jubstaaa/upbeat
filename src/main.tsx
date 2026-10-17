import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'

import StatusPage from '@/components/status-page/status-page'
import Providers from '@/providers/providers'

import './styles/globals.css'

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <Providers>
            <StatusPage />
        </Providers>
    </StrictMode>
)
