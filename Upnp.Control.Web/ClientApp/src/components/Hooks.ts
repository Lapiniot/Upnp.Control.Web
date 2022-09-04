import { RefObject, useCallback, useLayoutEffect, useRef } from "react";

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

export function useAutoFocusRef<T extends HTMLElement>(autoFocus: boolean | undefined = true) {
    const ref = useRef<T>(null);
    useLayoutEffect(() => {
        if (autoFocus) {
            ref.current?.setAttribute("autofocus", "");
        }
    }, [autoFocus]);
    return ref;
}

export function useAutoFocus<T extends HTMLElement>(ref: RefObject<T>, autoFocus: boolean | undefined = true) {
    useLayoutEffect(() => {
        if (autoFocus) {
            ref.current?.setAttribute("autofocus", "");
        }
    }, [autoFocus, ref]);
}

export function useLocalStorage(key: string): [string | null, (value: string | null) => void] {
    const value = localStorage.getItem(key);
    const setter = useCallback((value: string | null) => {
        if (value)
            localStorage.setItem(key, value)
        else
            localStorage.removeItem(key);
    }, [key]);
    return [value, setter];
}