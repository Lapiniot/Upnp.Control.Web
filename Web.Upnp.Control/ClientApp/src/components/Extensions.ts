import { EventHandler, SyntheticEvent } from "react";

export function reversemap<T, R>(array: T[], fn: (currentValue: T, index: number) => R): R[] {
    return array.reduceRight((acc, element, index) => {
        acc.push(fn(element, index));
        return acc;
    }, new Array<R>());
}

const pathRegex = new RegExp(":([\\w]+)[^/]*", "g");

export function generatePath<Params extends { [K in keyof any]: any }>(path: string, params: Params): string {
    return path.replace(pathRegex, (_, name) => params[name]);
}

export function parseMilliseconds(time: string): number {
    return new Date(`1970-01-01T${time}Z`).getTime();
}

export function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return "--:--";
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.round((seconds % 3600) % 60);
    return h > 0
        ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function viaProxy(url: string) {
    return `/proxy/${encodeURIComponent(url)}`;
}

const getSafeContentUrl = global.isSecureContext
    ? viaProxy
    : function (originalUrl: string) { return originalUrl; }

export { getSafeContentUrl };

/**
 * Finds first element in the DOM tree starting from 'element'
 * which acts as scrolling container (literally has effective values 
 * of overflow-y set to either "auto" or "scroll"). Please notice:
 * this function checks only vertical scroll behavior, as horizontal
 * must be completely abandoned concept in responsive apps.
 * @param {HTMLElement|null} element element to start search from
 * @returns {HTMLElement|null} element which is scrolling container 
 * or null if nothing suitable found
 */
export function findScrollParent(element: HTMLElement | null): HTMLElement | null {
    while (element) {
        if (element.classList.contains("overflow-auto") || element.classList.contains("overflow-scroll"))
            return element;

        const overflow = window.getComputedStyle(element).getPropertyValue("overflow-y");
        if (overflow === "auto" || overflow === "scroll")
            return element;

        element = element.parentElement;
    }

    return element;
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