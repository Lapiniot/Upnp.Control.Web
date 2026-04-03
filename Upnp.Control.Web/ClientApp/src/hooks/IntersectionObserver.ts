import { type RefObject, useEffect } from "react";

export function useIntersectionObserver(targetRef: RefObject<HTMLElement | null>,
    callback: IntersectionObserverCallback, enabled: boolean = true,
    root?: Document | Element | null, rootMargin?: string, threshold?: number | number[]) {
    useEffect(() => {
        const target = targetRef.current;
        if (target && enabled) {
            const observer = new IntersectionObserver(callback, { rootMargin, root, threshold });
            observer.observe(target);
            return () => {
                observer.disconnect();
            };
        }
    }, [targetRef, callback, enabled, root, rootMargin, threshold]);
}