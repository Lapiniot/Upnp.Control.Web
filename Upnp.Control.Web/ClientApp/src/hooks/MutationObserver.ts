import { type RefObject, useLayoutEffect } from "react";

export function useMutationObserver(elementRef: RefObject<Element | null>, callback: MutationCallback,
    attributes = true, childList = false, subtree = false) {
    useLayoutEffect(() => {
        const element = elementRef.current;
        if (element) {
            const observer = new MutationObserver(callback);
            observer.observe(element, { attributes, childList, subtree });
            return () => {
                observer.disconnect();
            };
        }
    }, [elementRef, callback, attributes, childList, subtree]);
}