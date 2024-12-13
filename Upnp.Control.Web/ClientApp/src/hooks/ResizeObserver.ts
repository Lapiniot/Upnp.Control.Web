import { RefObject, useLayoutEffect, useRef } from "react";

export function useResizeObserver(ref: RefObject<Element>, callback: ResizeObserverCallback) {
    const observerRef = useRef<ResizeObserver>(null);

    useLayoutEffect(() => {
        observerRef.current?.disconnect();
        observerRef.current = new ResizeObserver(callback);
        observerRef.current.observe(ref.current!);
        return () => {
            observerRef.current?.disconnect();
        };
    }, [ref, callback]);
}