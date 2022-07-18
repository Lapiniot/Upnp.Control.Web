import { RefObject, useLayoutEffect, useRef } from "react";

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