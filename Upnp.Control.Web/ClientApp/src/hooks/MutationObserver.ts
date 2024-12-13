import { RefObject, useLayoutEffect, useRef } from "react";

export function useMutationObserver(ref: RefObject<Element>, callback: MutationCallback, attributes = true, childList = false, subtree = false) {
    const observerRef = useRef<MutationObserver>(null);

    useLayoutEffect(() => {
        observerRef.current?.disconnect();
        observerRef.current = new MutationObserver(callback);
        observerRef.current.observe(ref.current!, { attributes, childList, subtree });
        return () => {
            observerRef.current?.disconnect();
        };
    }, [ref, callback, attributes, childList, subtree]);
}