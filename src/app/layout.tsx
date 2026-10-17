import type { CSSProperties, ReactNode } from 'react'

import { Inter, JetBrains_Mono } from 'next/font/google'

import Providers from '@/components/providers'
import { getConfig } from '@/lib/config'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
})

export default function RootLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    const { accentColor } = getConfig()
    const accentStyle = accentColor
        ? ({ '--accent': accentColor } as CSSProperties)
        : undefined

    return (
        <html
            className={`${inter.variable} ${mono.variable}`}
            data-accent={accentColor ? '' : undefined}
            lang="en"
            style={accentStyle}>
            <body className="bg-canvas font-sans text-ink antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
