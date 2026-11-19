import { describe, expect, it } from 'vitest'

import { matchesHeaderPath, parseHeadersFile } from './headers-file'

describe('parseHeadersFile', () => {
    it('reads each path block and ignores comments and blank lines', () => {
        const rules = parseHeadersFile(
            [
                '# comment',
                '/*',
                '  X-Content-Type-Options: nosniff',
                "  Content-Security-Policy: default-src 'self'; img-src https:",
                '',
                '/assets/*',
                '  Cache-Control: public, max-age=31536000, immutable',
            ].join('\n')
        )
        expect(rules).toEqual([
            {
                headers: {
                    'Content-Security-Policy':
                        "default-src 'self'; img-src https:",
                    'X-Content-Type-Options': 'nosniff',
                },
                path: '/*',
            },
            {
                headers: {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
                path: '/assets/*',
            },
        ])
    })
})

describe('matchesHeaderPath', () => {
    it('treats * as a splat and everything else literally', () => {
        expect(matchesHeaderPath('/*', '/')).toBe(true)
        expect(matchesHeaderPath('/assets/*', '/assets/index-1.js')).toBe(true)
        expect(matchesHeaderPath('/assets/*', '/api/status')).toBe(false)
        expect(matchesHeaderPath('/badge.svg', '/badgexsvg')).toBe(false)
    })
})
