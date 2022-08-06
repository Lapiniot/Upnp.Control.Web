import { RefObject, useLayoutEffect, useRef } from "react";

export function useResizeObserver(ref: RefObject<Element>, callback: ResizeObserverCallback) {
    const observerRef = useRef<ResizeObserver>();

    useLayoutEffect(() => {
        observerRef.current?.disconnect();
        observerRef.current = new ResizeObserver(callback);
        observerRef.current.observe(ref.current!);
        return () => {
            observerRef.current?.disconnect();
        };
    }, [ref, callback]);
}

export function useMutationObserver(ref: RefObject<Element>, callback: MutationCallback, attributes = true, childList = false, subtree = false) {
    const observerRef = useRef<MutationObserver>();

    useLayoutEffect(() => {
        observerRef.current?.disconnect();
        observerRef.current = new MutationObserver(callback);
        observerRef.current.observe(ref.current!, { attributes, childList, subtree });
        return () => {
            observerRef.current?.disconnect();
        }
    }, [ref, callback, attributes, childList, subtree]);
}