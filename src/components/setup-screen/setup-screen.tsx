const CODE = 'rounded bg-empty px-1.5 py-0.5 font-mono text-sm'

export default function SetupScreen() {
    return (
        <main className="mx-auto max-w-xl px-4 py-16">
            <h1 className="text-2xl font-semibold tracking-tight">
                Connect UptimeRobot
            </h1>
            <p className="mt-2 text-muted">
                This status page needs a read-only UptimeRobot API key. If you
                already set one, UptimeRobot rejected it.
            </p>
            <ol className="mt-8 list-decimal space-y-3 pl-5">
                <li>
                    In UptimeRobot, open{' '}
                    <a
                        className="font-medium underline underline-offset-2"
                        href="https://dashboard.uptimerobot.com/integrations"
                        rel="noopener">
                        Integrations &amp; API
                    </a>{' '}
                    and create a <strong>Read-only API key</strong>.
                </li>
                <li>
                    Set it as <code className={CODE}>UPTIMEROBOT_API_KEY</code>{' '}
                    and redeploy or restart.
                </li>
                <li>
                    Just looking around? Set{' '}
                    <code className={CODE}>DEMO=true</code> to see sample data.
                </li>
            </ol>
        </main>
    )
}
