# Contributing to upbeat

First off, thanks for taking the time to contribute! Bug reports, feature
ideas, documentation and code are all welcome.

## Code of Conduct

Be respectful, inclusive, and professional. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Found a bug? Please report it by [opening an issue](https://github.com/Jubstaaa/upbeat/issues/new?template=bug_report.md).

- Check if the bug already exists in [issues](https://github.com/Jubstaaa/upbeat/issues)
- Try to reproduce it with the latest version, and with `DEMO=true` if you can
- Say where it runs (Vercel, Cloudflare or Docker) and include any server logs

### Suggesting Enhancements

[Open a discussion](https://github.com/Jubstaaa/upbeat/discussions) with the use
case and why it would help.

### Contributing Code

#### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/upbeat.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

#### Development Setup

```bash
npm install
cp .env.example .env.local
DEMO=true npm run dev
```

`DEMO=true` serves built-in sample data, so you do not need an UptimeRobot key
to work on the page. To use your own account, put a read-only key in
`.env.local` as `UPTIMEROBOT_API_KEY`.

#### Checks

Every pull request runs these, so run them before you push:

```bash
npm run lint
npm run format:check
npm run type-check
npm test
npm run build && npm run test:e2e
```

For UI changes, also look at the page in both light and dark themes and at
phone width, and include screenshots in the pull request.

#### Code Style

- Prettier and ESLint are the source of truth; `npm run format` and
  `npx eslint --fix .` fix most issues
- Kebab-case file names, one component per file in `src/components/`, its
  props in a `.types.ts` file beside it
- Anything that talks to UptimeRobot lives in `src/lib/uptimerobot.ts`; the UI,
  badge and feed only see `StatusData`
- No comments in source unless the logic is genuinely non-obvious
- Add a test for every behaviour change. When you add a test for existing
  behaviour, break the code once to confirm the test fails, then restore it

#### Project Structure

```
src/
├── app/            # Page, layout and the /api/status, /badge.svg, /feed.xml routes
├── components/     # The page, one file per component
└── lib/            # Config, UptimeRobot client, transform, cache, badge, feed
e2e/                # Playwright smoke test (runs against DEMO=true)
```

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(badge): add a flat-square style`
- `fix(transform): keep monitors with a slash in the URL ungrouped`
- `docs(readme): explain SITE_URL behind a proxy`

## Pull Request Process

1. Update `README.md` for user-facing changes
2. Make sure every check above passes
3. Describe what the PR does and link related issues
4. Address review feedback

## Questions?

- Open a [GitHub Discussion](https://github.com/Jubstaaa/upbeat/discussions)
- Email: ilkerbalcilartr@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the
MIT License.
