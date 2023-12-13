import { ReactNode, ReactPortal } from "react";
import { createPortal } from "react-dom";

type RenderFunc = (children: ReactNode, key?: string) => ReactPortal | null;

export function usePortal(selector: string): [HTMLElement | null, RenderFunc] {
    const container = document.querySelector<HTMLElement>(selector);
    return [container, (children, key) => container ? createPortal(children, container, key) : null];
}