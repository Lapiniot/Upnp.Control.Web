import { type RefObject, useLayoutEffect, useRef } from "react";

export function useAutoFocusRef<T extends HTMLElement>(autoFocus: boolean | undefined = true) {
    const ref = useRef<T>(null);
    useAutoFocus(ref, autoFocus);
    return ref;
}

export function useAutoFocus<T extends HTMLElement>(ref: RefObject<T | null>, autoFocus: boolean | undefined = true) {
    useLayoutEffect(() => {
        if (autoFocus) {
            ref.current?.setAttribute("autofocus", "");
        } else {
            ref.current?.removeAttribute("autofocus")
        }
    }, [autoFocus, ref]);
}