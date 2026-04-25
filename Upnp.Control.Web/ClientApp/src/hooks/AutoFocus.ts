import { type RefObject, useCallback, useLayoutEffect } from "react";

function useAutoFocusCallback<T extends HTMLElement>(autoFocus: boolean): (element: T) => void {
    const callback = useCallback((element: T) => {
        if (element) {
            if (autoFocus) {
                element.setAttribute("autofocus", "");
            } else {
                element.removeAttribute("autofocus");
            }
        }
    }, [autoFocus]);

    return callback;
}

function useAutoFocusRef<T extends HTMLElement>(elementRef: RefObject<T | null>, autoFocus: boolean): void {
    useLayoutEffect(() => {
        const element = elementRef.current;
        if (element) {
            if (autoFocus) {
                element.setAttribute("autofocus", "");
            } else {
                element.removeAttribute("autofocus");
            }
        }
    }, [autoFocus, elementRef]);
}

export function useAutoFocus<T extends HTMLElement>(): (element: T) => void
export function useAutoFocus<T extends HTMLElement>(autoFocus: boolean): (element: T) => void
export function useAutoFocus<T extends HTMLElement>(elementRef: RefObject<T | null>): void
export function useAutoFocus<T extends HTMLElement>(elementRef: RefObject<T | null>, autoFocus: boolean): void

export function useAutoFocus<T extends HTMLElement>(...args: any[]): ((element: T) => void) | void | never {
    if (args.length === 0) {
        return useAutoFocusCallback(true);
    } else if (args.length === 1) {
        if (typeof args[0] === "boolean") {
            return useAutoFocusCallback(args[0]);
        } else if (typeof args[0] === "object") {
            return useAutoFocusRef(args[0], true);
        }
    } else if (args.length === 2 && typeof args[0] === "object" && typeof args[1] === "boolean") {
        return useAutoFocusRef(args[0], args[1]);
    }

    throw Error("Invalid arguments");
}