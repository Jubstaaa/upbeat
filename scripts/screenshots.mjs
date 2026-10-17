import { mkdirSync } from 'node:fs'

import { chromium } from '@playwright/test'

const [url = 'http://localhost:3000', outDir = 'test-results/screens'] =
    process.argv.slice(2)

const shots = [
    {
        colorScheme: 'light',
        name: 'light',
        viewport: { height: 1100, width: 1100 },
    },
    {
        colorScheme: 'dark',
        name: 'dark',
        viewport: { height: 1100, width: 1100 },
    },
    {
        colorScheme: 'dark',
        name: 'mobile',
        viewport: { height: 900, width: 390 },
    },
]

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()

for (const shot of shots) {
    const page = await browser.newPage({
        colorScheme: shot.colorScheme,
        viewport: shot.viewport,
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3_000)
    await page.screenshot({
        fullPage: true,
        path: `${outDir}/${shot.name}.png`,
    })
    const hasScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
    )
    console.log(
        `${shot.name}: errors ${errors.length ? errors.join(' | ') : 'none'}, horizontal scroll ${hasScroll}`
    )
    await page.close()
}

await browser.close()
