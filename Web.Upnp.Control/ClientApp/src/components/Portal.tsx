import { PropsWithChildren, ReactNode, ReactPortal } from "react";
import { createPortal } from "react-dom";

export function Portal({ children, selector }: PropsWithChildren<{ selector: string; }>) {
    const container = document.querySelector<HTMLElement>(selector);
    return container && children ? createPortal(children, container) : null;
}

type RenderFunc = (children: ReactNode, key?: string) => ReactPortal | null;

export function usePortal(selector: string): [HTMLElement | null, RenderFunc] {
    const container = document.querySelector<HTMLElement>(selector);
    return [container, (children, key) => container ? createPortal(children, container, key) : null];
}