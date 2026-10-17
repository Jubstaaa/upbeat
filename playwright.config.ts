import { defineConfig, devices } from '@playwright/test'

const PORT = 3100

export default defineConfig({
    forbidOnly: Boolean(process.env.CI),
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    testDir: './e2e',
    use: { baseURL: `http://localhost:${PORT}` },
    webServer: {
        command: `bun run start -p ${PORT}`,
        env: { DEMO: 'true' },
        reuseExistingServer: !process.env.CI,
        url: `http://localhost:${PORT}`,
    },
})
