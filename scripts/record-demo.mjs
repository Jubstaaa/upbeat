import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://localhost:3000'
const videoDir = mkdtempSync(join(tmpdir(), 'upbeat-demo-'))
const size = { height: 720, width: 960 }

const browser = await chromium.launch()
const context = await browser.newContext({
    colorScheme: 'dark',
    recordVideo: { dir: videoDir, size },
    viewport: size,
})
const page = await context.newPage()
await page.goto(url)
await page.waitForTimeout(2_500)
await page.locator('[data-index="78"]').first().hover()
await page.waitForTimeout(1_200)
const row = page.getByRole('button', { name: /Public API/ })
await row.click()
await page.waitForTimeout(2_500)
await row.click()
await page.waitForTimeout(800)
await context.close()
await browser.close()

const video = join(videoDir, readdirSync(videoDir)[0])
execFileSync(
    'ffmpeg',
    [
        '-y',
        '-i',
        video,
        '-vf',
        'fps=15,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer',
        '-loop',
        '0',
        'assets/demo.gif',
    ],
    { stdio: 'inherit' }
)
