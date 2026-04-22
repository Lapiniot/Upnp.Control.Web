import { type RefObject, useLayoutEffect } from "react";

export function useResizeObserver(targetRef: RefObject<HTMLElement | null>, callback: ResizeObserverCallback) {
    useLayoutEffect(() => {
        const element = targetRef.current;
        if (element) {
            const observer = new ResizeObserver(callback);
            observer.observe(element);
            return () => {
                observer.unobserve(element);
                observer.disconnect();
            }
        }
    }, [targetRef, callback]);
}