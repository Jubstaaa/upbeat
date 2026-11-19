import type { ActiveBar } from './uptime-bars.types'

export function toActiveBar(
    target: EventTarget,
    isTouch: boolean
): ActiveBar | null {
    if (!(target instanceof HTMLElement)) return null
    if (target.dataset.index === undefined) return null
    return {
        index: Number(target.dataset.index),
        isTouch,
        left: target.offsetLeft,
        width: target.offsetWidth,
    }
}
