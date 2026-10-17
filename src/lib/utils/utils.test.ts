import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
    it('joins truthy class names and drops the rest', () => {
        expect(
            cn('a', false, null, undefined, 'b', { c: true, d: false })
        ).toBe('a b c')
    })
})

describe('cn with Tailwind classes', () => {
    it('lets a later class override a conflicting one', () => {
        expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4')
    })

    it('keeps a stroke width and a stroke colour together', () => {
        expect(cn('fill-none stroke-[1.5]', 'stroke-up')).toBe(
            'fill-none stroke-[1.5] stroke-up'
        )
    })
})
