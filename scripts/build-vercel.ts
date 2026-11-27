import { cp, readFile, rm, writeFile } from 'node:fs/promises'

import { parseHeadersFile } from '../src/server/headers-file'

const OUTPUT = '.vercel/output'
const FUNCTION = `${OUTPUT}/functions/api.func`

await rm(OUTPUT, { force: true, recursive: true })
await cp('dist/client', `${OUTPUT}/static`, { recursive: true })
await rm(`${OUTPUT}/static/_headers`)

const result = await Bun.build({
    entrypoints: ['src/server/vercel.ts'],
    format: 'esm',
    minify: true,
    naming: 'index.mjs',
    outdir: FUNCTION,
    target: 'node',
})
if (!result.success)
    throw new AggregateError(result.logs, 'Vercel function build failed')

await writeFile(
    `${FUNCTION}/.vc-config.json`,
    JSON.stringify({
        handler: 'index.mjs',
        launcherType: 'Nodejs',
        runtime: 'nodejs22.x',
        shouldAddHelpers: false,
    })
)

const headerRoutes = parseHeadersFile(
    await readFile('public/_headers', 'utf8')
).map(({ headers, path }) => ({
    continue: true,
    headers,
    src: `^${path.replaceAll('.', '\\.').replaceAll('*', '.*')}$`,
}))

await writeFile(
    `${OUTPUT}/config.json`,
    JSON.stringify({
        routes: [
            ...headerRoutes,
            { dest: '/api', src: '^/(api/.*|badge\\.svg|feed\\.xml)$' },
            { handle: 'filesystem' },
            { dest: '/index.html', src: '/(.*)' },
        ],
        version: 3,
    })
)
