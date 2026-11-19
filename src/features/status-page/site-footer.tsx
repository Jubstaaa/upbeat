const LINK = 'text-muted-foreground underline-offset-2 hover:underline'

export default function SiteFooter() {
    return (
        <footer className="mt-10 flex flex-wrap gap-x-1.5 text-sm text-faint">
            <span>
                Monitored by{' '}
                <a
                    className={LINK}
                    href="https://uptimerobot.com"
                    rel="noopener">
                    UptimeRobot
                </a>
            </span>
            <span aria-hidden>·</span>
            <span>
                Powered by{' '}
                <a
                    className={LINK}
                    href="https://github.com/Jubstaaa/upbeat"
                    rel="noopener">
                    upbeat
                </a>
            </span>
            <span aria-hidden>·</span>
            <a className={LINK} href="/feed.xml">
                Feed
            </a>
        </footer>
    )
}
