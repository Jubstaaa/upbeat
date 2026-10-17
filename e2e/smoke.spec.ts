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
