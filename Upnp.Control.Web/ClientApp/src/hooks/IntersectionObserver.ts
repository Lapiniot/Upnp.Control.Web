import { type RefObject, useEffect } from "react";

export function useIntersectionObserver(elementRef: RefObject<HTMLElement | null>,
    callback: IntersectionObserverCallback, enabled: boolean = true,
    root?: Document | Element | null, rootMargin?: string, threshold?: number | number[]) {
    useEffect(() => {
        const element = elementRef.current;
        if (element && enabled) {
            const observer = new IntersectionObserver(callback, { rootMargin, root, threshold });
            observer.observe(element);
            return () => {
                observer.unobserve(element);
                observer.disconnect();
            };
        }
    }, [elementRef, callback, enabled, root, rootMargin, threshold]);
}