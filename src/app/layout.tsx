import type { ReactNode } from 'react'

import './globals.css'

export default function RootLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <body className="bg-canvas text-ink antialiased">{children}</body>
        </html>
    )
}
