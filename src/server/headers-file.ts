export interface HeaderRule {
    headers: Record<string, string>
    path: string
}

export function matchesHeaderPath(rulePath: string, pathname: string): boolean {
    return new URLPattern({ pathname: rulePath }).test({ pathname })
}

export function parseHeadersFile(text: string): HeaderRule[] {
    const rules: HeaderRule[] = []
    for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        if (!/^\s/.test(line)) {
            rules.push({ headers: {}, path: trimmed })
            continue
        }
        const separator = trimmed.indexOf(':')
        const rule = rules.at(-1)
        if (!rule || separator < 1) continue
        rule.headers[trimmed.slice(0, separator).trim()] = trimmed
            .slice(separator + 1)
            .trim()
    }
    return rules
}
