import { HTMLAttributes, MutableRefObject, useCallback, useEffect, useRef } from "react";

type ToastProps = HTMLAttributes<HTMLDivElement> & {
    header?: string;
    hint?: string;
    color?: UI.ThemeColors;
    autohide?: boolean;
    animation?: boolean;
    delay?: number;
    onDismissed?: (element: HTMLDivElement) => void;
}

function resetTimeout(ref: MutableRefObject<number | undefined>) {
    if (ref.current) {
        clearTimeout(ref.current);
        ref.current = undefined;
    }
}

export function Toast({ header, hint, color, children, autohide, animation = true, delay = 5000, className, onDismissed, ...other }: ToastProps) {
    const ref = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number>();

    const close = useCallback(() => {
        resetTimeout(timeoutRef);
        const target = ref.current!;
        target.classList.add("showing");
        Promise.allSettled(target.getAnimations().map(a => a.finished)).then(() => {
            target.classList.remove("show");
            onDismissed?.(target);
        })
    }, [onDismissed]);

    useEffect(() => {
        resetTimeout(timeoutRef);
        const target = ref.current!;
        target.classList.add("show", "showing");
        target.offsetHeight;
        target.classList.remove("showing");

        if (autohide) {
            Promise.allSettled(target.getAnimations().map(a => a.finished)).then(() => {
                timeoutRef.current = window.setTimeout(() => close(), delay);
            })
        }
    }, [autohide, delay, close]);

    return <div ref={ref} className={`toast${animation ? " fade" : ""}${className ? ` ${className}` : ""}`} role="alert" aria-live="assertive" aria-atomic="true" {...other}>
        <div className="toast-header">
            {color &&
                <svg className={`me-2 flex-shrink-0 icon text-${color}`} viewBox="0 0 16 16" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false">
                    <circle cx="50%" cy="50%" r="50%" />
                </svg>}
            <strong className="me-auto">{header}</strong>
            {hint && <small>{hint}</small>}
            <button type="button" className="btn-close" aria-label="Close" onClick={close} />
        </div>
        <div className="toast-body">{children}</div>
    </div>
}