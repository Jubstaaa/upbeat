# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.2] - 2026-10-17

### Added

- Deploy to Vercel: the page is served as static files and the API runs as one Node.js function built with the Build Output API.

### Fixed

- Monitor ids no longer change when a monitor with the same name is added; the oldest keeps the plain id and newer ones get their UptimeRobot id as a suffix.
- Monitors that have not been checked yet are no longer counted as up.
- "Updated" in the header starts from the real time, so old data never reads "just now".
- "Try again" shows that it is retrying, and errors are retried after 5 seconds instead of 10.
- Prerelease tags no longer move the `latest` Docker image or GitHub release.

## [1.0.1] - 2026-10-17

### Fixed

- Faster first load with many monitors: the uptime bars reveal with one animation per row instead of one per day, the day tooltip is created only while hovering, and rows below the fold are not drawn until they scroll into view.

## [1.0.0] - 2026-10-17

### Added

- Status page for UptimeRobot with an animated heartbeat, 90-day uptime bars, response-time sparklines and expandable rows.
- Groups from monitor names, recent incidents with simultaneous outages merged, and a scheduled maintenance banner.
- `/badge.svg` for the page or one monitor, and an Atom feed at `/feed.xml`.
- Configuration through environment variables, a demo mode, light and dark themes and reduced-motion support.
- Runs on Cloudflare Workers' free plan: the page is static, and the Hono API answers `/api/status`, the badge and the feed from a one-minute edge cache.
- One-click Deploy to Cloudflare button, and a multi-arch Docker image on ghcr.io that runs on Bun.

[1.0.2]: https://github.com/Jubstaaa/upbeat/releases/tag/v1.0.2
[1.0.1]: https://github.com/Jubstaaa/upbeat/releases/tag/v1.0.1
[1.0.0]: https://github.com/Jubstaaa/upbeat/releases/tag/v1.0.0
