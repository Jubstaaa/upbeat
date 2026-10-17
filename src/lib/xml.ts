const ENTITIES: Record<string, string> = {
    "'": '&apos;',
    '"': '&quot;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
}

export function escapeXml(value: string): string {
    return value.replace(/["&'<>]/g, character => ENTITIES[character])
}
