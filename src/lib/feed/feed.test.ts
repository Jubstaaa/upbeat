import { describe, expect, it } from 'vitest'

import { createDemoMonitors } from '@/lib/demo/demo'
import { toStatusData } from '@/lib/status/status.utils'

import { renderFeed } from './feed'

const NOW = 1_791_972_000
const data = toStatusData(createDemoMonitors(NOW), NOW)

describe('renderFeed', () => {
    it('is an Atom feed linking back to the site', () => {
        const xml = renderFeed({
            data,
            now: NOW,
            siteUrl: 'https://status.example.com',
            title: 'Acme Status',
        })
        expect(xml).toMatch(/^<\?xml version="1.0" encoding="utf-8"\?>/)
        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
        expect(xml).toContain(
            '<link rel="self" href="https://status.example.com/feed.xml"/>'
        )
        expect(xml.match(/<entry>/g)).toHaveLength(
            data.incidents.length + data.maintenance.length
        )
        expect(xml).toContain('<title>2 services were down</title>')
    })

    it('lists newest entries first', () => {
        const xml = renderFeed({
            data,
            now: NOW,
            siteUrl: 'https://s.example',
            title: 'S',
        })
        const updated = [
            ...xml.matchAll(/<entry>.*?<updated>([^<]+)<\/updated>/g),
        ].map(match => match[1])
        expect(updated).toEqual([...updated].sort().reverse())
    })

    it('escapes the title and renders an empty feed without data', () => {
        const xml = renderFeed({
            data: null,
            now: NOW,
            siteUrl: 'https://s.example',
            title: 'R&D',
        })
        expect(xml).toContain('<title>R&amp;D</title>')
        expect(xml).not.toContain('<entry>')
        expect(xml).toContain(
            `<updated>${new Date(NOW * 1000).toISOString()}</updated>`
        )
    })
})
