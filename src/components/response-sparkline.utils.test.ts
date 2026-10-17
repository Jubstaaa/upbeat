import { describe, expect, it } from 'vitest'

import { buildSparkline } from './response-sparkline.utils'

function points(values: number[]) {
    return values.map((ms, index) => ({ at: index * 300, ms }))
}

function coordinates(path: string): number[][] {
    return path.split(' ').reduce<number[][]>((all, token, index, tokens) => {
        if (/^[ML]/.test(token))
            all.push([Number(token.slice(1)), Number(tokens[index + 1])])
        return all
    }, [])
}

describe('buildSparkline', () => {
    it('needs at least two points', () => {
        expect(buildSparkline(points([]), 100, 20)).toBe('')
        expect(buildSparkline(points([120]), 100, 20)).toBe('')
    })

    it('spans the full width and stays inside the height', () => {
        const coords = coordinates(
            buildSparkline(points([100, 400, 250]), 100, 20)
        )
        expect(coords[0][0]).toBe(0)
        expect(coords.at(-1)?.[0]).toBe(100)
        expect(coords.every(([, y]) => y >= 0 && y <= 20)).toBe(true)
        expect(coords[1][1]).toBeLessThan(coords[0][1])
    })

    it('draws a flat series through the middle', () => {
        const coords = coordinates(
            buildSparkline(points([200, 200, 200]), 100, 20)
        )
        expect(coords.every(([, y]) => y === 10)).toBe(true)
    })
})
