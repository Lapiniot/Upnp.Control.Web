import { useEffect } from "react";

export function useIntersectionObserver(target: HTMLElement | null | undefined,
    callback: IntersectionObserverCallback, enabled: boolean = true,
    root?: Document | Element | null, rootMargin?: string, threshold?: number | number[]) {
    useEffect(() => {
        if (target && enabled) {
            const observer = new IntersectionObserver(callback, { rootMargin, root, threshold });
            observer.observe(target);
            return () => {
                observer.disconnect();
            };
        }
    }, [target, callback, enabled, root, rootMargin, threshold]);
}