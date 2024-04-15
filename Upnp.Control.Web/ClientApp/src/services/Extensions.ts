import { EventHandler, SyntheticEvent } from "react";

export function reversemap<T, R>(array: T[], fn: (currentValue: T, index: number) => R): R[] {
    return array.reduceRight((acc, element, index) => {
        acc.push(fn(element, index));
        return acc;
    }, new Array<R>());
}

export function parseMilliseconds(time: string): number {
    return new Date(`1970-01-01T${time}Z`).getTime();
}

export function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return "--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round((seconds % 3600) % 60);
    return h > 0
        ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatTrackInfoLine(artist: string | undefined, album: string | undefined, date: string | undefined) {
    return `${artist ?? ""}${date ? `${artist ? "\xA0\u2022\xA0" : ""}${date}` : ""}${album ? `${artist || date ? "\xA0\u2022\xA0" : ""}${album}` : ""}`;
}

export function viaProxy(url: string) {
    return `/proxy/${encodeURIComponent(url)}`;
}

export function nopropagation<E extends SyntheticEvent>(handler: EventHandler<E>): EventHandler<E> {
    return (event: E) => {
        event.stopPropagation();
        return handler(event);
    };
}

export function toBase64(buffer: ArrayBuffer | null): string | null {
    return buffer ? btoa(String.fromCharCode(...new Uint8Array(buffer))) : null;
}

export function fromBase64(str: string): Uint8Array {
    const bstr = atob(str);
    const array = new Uint8Array(bstr.length);
    for (let index = 0; index < bstr.length; index++) {
        array[index] = bstr.charCodeAt(index);
    }
    return array;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => any>(fn: F, delay: number = 500) {
    let timeout: number;
    return function (this: unknown, ...args: Parameters<F>) {
        clearTimeout(timeout);
        timeout = window.setTimeout((args: Parameters<F>) => fn.apply(this, args), delay, args);
    }
}

export async function animate(element: HTMLElement, completion: (element: HTMLElement) => Promise<unknown>, ...classTokens: string[]) {
    element.classList.add(...classTokens);
    await completion(element);
    element.classList.remove(...classTokens);
}

export function clamp(min: number, value: number, max: number) {
    return Math.min(Math.max(min, value), max);
}