import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

export function Portal({ children, selector }: PropsWithChildren<{ selector: string; }>) {
    const container = document.querySelector<HTMLElement>(selector);
    return container && children ? createPortal(children, container) : null;
}