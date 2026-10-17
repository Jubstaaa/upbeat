import { describe, expect, it } from 'vitest'

import { parseHash } from './status-page.utils'

describe('parseHash', () => {
    it('reads a monitor id', () => {
        expect(parseHash('#public-api')).toBe('public-api')
        expect(parseHash('')).toBe('')
    })

    it('decodes escaped characters', () => {
        expect(parseHash('#caf%C3%A9')).toBe('café')
    })

    it('ignores a malformed hash instead of throwing', () => {
        expect(parseHash('#%E0%A4%A')).toBe('')
    })
})
