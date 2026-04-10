import { useIntersectionObserver } from "@hooks/IntersectionObserver";
import { useCallback, useRef } from "react";

export function useInfiniteScroll(loader: (() => unknown) | undefined,
    root?: Document | Element | null, rootMargin?: string, threshold?: number | number[]) {
    const scrollTrackerRef = useRef<HTMLDivElement>(null);
    const callback = useCallback(([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting)
            loader?.();
    }, [loader]);

    useIntersectionObserver(scrollTrackerRef, callback, !!loader, root, rootMargin, threshold);

    return scrollTrackerRef;
}