import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('renders the demo page without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'All systems operational'
    )
    await expect(
        page.getByRole('button', { name: /Marketing site/ })
    ).toBeVisible()
    await expect(page.getByText('2 services were down')).toBeVisible()
    expect(errors).toEqual([])
})

test('expands a row and puts it in the URL', async ({ page }) => {
    await page.goto('/')
    const row = page.getByRole('button', { name: /Public API/ })
    await row.click()
    await expect(row).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('Response time, last 24 hours')).toBeVisible()
    await expect(page).toHaveURL(/#public-api$/)
    await row.click()
    await expect(row).toHaveAttribute('aria-expanded', 'false')
})

test('opens the row named in the hash', async ({ page }) => {
    await page.goto('/#webhooks')
    await expect(
        page.getByRole('button', { name: /Webhooks/ })
    ).toHaveAttribute('aria-expanded', 'true')
})

test('shows a tooltip for a day', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-index="89"]').first().hover()
    await expect(page.getByRole('tooltip')).toContainText(/uptime|No data/)
})

test('fits a phone screen', async ({ page }) => {
    await page.setViewportSize({ height: 800, width: 375 })
    await page.goto('/')
    const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(overflows).toBe(false)
})

test('does not shift the layout while loading', async ({ page }) => {
    await page.setViewportSize({ height: 800, width: 375 })
    await page.goto('/', { waitUntil: 'networkidle' })
    const shift = await page.evaluate(
        () =>
            new Promise<number>(resolve => {
                new PerformanceObserver(list => {
                    resolve(
                        list
                            .getEntries()
                            .reduce(
                                (sum, entry) =>
                                    sum +
                                    (entry as unknown as { value: number })
                                        .value,
                                0
                            )
                    )
                }).observe({ buffered: true, type: 'layout-shift' })
                setTimeout(() => resolve(0), 1_000)
            })
    )
    expect(shift).toBeLessThan(0.01)
})

test('serves the badge and the feed', async ({ request }) => {
    const badge = await request.get('/badge.svg')
    expect(badge.headers()['content-type']).toContain('image/svg+xml')
    expect(await badge.text()).toContain('operational')
    expect(
        await (await request.get('/badge.svg?monitor=public-api')).text()
    ).toContain('Public API')
    const feed = await request.get('/feed.xml')
    expect(feed.headers()['content-type']).toContain('application/atom+xml')
    expect(await feed.text()).toContain('2 services were down')
})

test('sends security and cache headers with the page', async ({
    page,
    request,
}) => {
    const response = await request.get('/')
    expect(response.headers()['content-security-policy']).toContain(
        "default-src 'self'"
    )
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
    await page.goto('/')
    const script = await page
        .locator('script[type="module"]')
        .first()
        .getAttribute('src')
    const asset = await request.get(script ?? '')
    expect(asset.headers()['cache-control']).toContain('immutable')
})

test('skips the expand animation when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'networkidle' })
    const opacity = await page.evaluate(async () => {
        const row = [...document.querySelectorAll('button')].find(button =>
            button.textContent?.includes('Public API')
        )
        row?.click()
        await new Promise(requestAnimationFrame)
        await new Promise(requestAnimationFrame)
        const details = document.querySelector(
            '#public-api [data-slot="collapsible-content"]'
        )
        return details ? getComputedStyle(details).opacity : null
    })
    expect(opacity).toBe('1')
})

test.describe('on a phone', () => {
    test.use({
        hasTouch: true,
        isMobile: true,
        viewport: { height: 800, width: 375 },
    })

    test('shows the day when a bar is tapped', async ({ page }) => {
        await page.goto('/')
        const bars = page.locator('[role="img"]').first()
        const day = page.getByRole('dialog')
        await bars.locator('[data-index="89"]').tap()
        await expect(day).toContainText(/uptime|No data/)
        const today = await day.textContent()
        await bars.locator('[data-index="80"]').tap()
        await expect(day).not.toHaveText(today ?? '')
        await page.getByRole('heading', { level: 1 }).tap()
        await expect(day).toBeHidden()
    })
})

for (const colorScheme of ['light', 'dark'] as const) {
    test(`has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
        await page.goto('/')
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        const { violations } = await new AxeBuilder({ page }).analyze()
        expect(violations.map(violation => violation.id)).toEqual([])
    })
}
