# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-17

### Added

- Status page for UptimeRobot with an animated heartbeat, 90-day uptime bars, response-time sparklines and expandable rows.
- Groups from monitor names, recent incidents with simultaneous outages merged, and a scheduled maintenance banner.
- `/badge.svg` for the page or one monitor, and an Atom feed at `/feed.xml`.
- Configuration through environment variables, a demo mode, light and dark themes and reduced-motion support.
- Runs on Cloudflare Workers' free plan: the page is static, and the Hono API answers `/api/status`, the badge and the feed from a one-minute edge cache.
- One-click Deploy to Cloudflare button, and a multi-arch Docker image on ghcr.io that runs on Bun.

[1.0.0]: https://github.com/Jubstaaa/upbeat/releases/tag/v1.0.0
