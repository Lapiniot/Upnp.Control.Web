import { useCallback, useMemo, useRef } from "react";
import { useIntersectionObserver } from "./IntersectionObserver";

export function useInfiniteScroll(loader: (() => unknown) | undefined,
    root?: Document | Element | null, rootMargin?: string, threshold?: number | number[]) {
    const scrollTrackerRef = useRef<HTMLDivElement>(null);
    const scrollTracker = useMemo(() => <div ref={scrollTrackerRef} className="pe-none" />, []);
    const callback = useCallback(([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting)
            loader?.();
    }, [loader]);
    useIntersectionObserver(scrollTrackerRef.current, callback, !!loader, root, rootMargin, threshold);
    return scrollTracker;
}