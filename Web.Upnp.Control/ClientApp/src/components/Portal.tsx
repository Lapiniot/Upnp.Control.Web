import { PropsWithChildren } from "react";
import ReactDOM from "react-dom";

export function Portal({ children, selector }: PropsWithChildren<{ selector: string; }>) {
    const container = document.querySelector<HTMLElement>(selector);
    return container ? ReactDOM.createPortal(children, container) : null;
}