import { DetailsHTMLAttributes, useCallback, useRef } from "react";
import { useResizeObserver } from "../hooks/ResizeObserver";

type SpoilerProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
    title: string;
    disabled?: boolean;
}

export default ({ title, children, className, disabled, ...other }: SpoilerProps) => {
    const ref = useRef<HTMLDetailsElement>(null);

    const callback = useCallback(({ 0: { target } }: ResizeObserverEntry[]) => {
        const details = target as HTMLDetailsElement;
        const summary = details.querySelector<HTMLElement>(":scope > summary")!;
        const container = details.querySelector<HTMLElement>(":scope > div")!;
        details.style.setProperty("--collapsed-height", `${summary.offsetHeight}px`);
        details.style.setProperty("--expanded-height", `${summary.offsetHeight + container.offsetHeight}px`);
    }, []);

    useResizeObserver(ref, callback);

    return <details ref={ref} className={`spoiler${className ? ` ${className}` : ""}`} {...other} inert={disabled ? "" : undefined}>
        <summary>{title}</summary>
        <div>{children}</div>
    </details>
}