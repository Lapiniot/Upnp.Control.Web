import { HTMLAttributes, useCallback, useEffect, useRef } from "react";

type SnackbarProps = HTMLAttributes<HTMLDivElement> & { onDismissed?: (element: HTMLDivElement) => void } & (
    { dismissSignal?: undefined; actionText: string; onAction: () => void } |
    { dismissSignal: AbortSignal; actionText?: undefined; onAction?: undefined } |
    { dismissSignal?: undefined; actionText?: undefined; onAction?: undefined }
)

export function Snackbar({ children, actionText, onAction, className, dismissSignal, onDismissed, ...other }: SnackbarProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    const dismiss = useCallback(async () => {
        const target = elementRef.current!;
        target.classList.add("showing");
        await Promise.allSettled(target.getAnimations().map(a => a.finished));
        target.classList.remove("show", "showing");
        onDismissed?.(target);
    }, [onDismissed]);

    const action = useCallback(async () => {
        await dismiss();
        onAction?.();
    }, [dismiss, onAction]);

    useEffect(() => {
        if (dismissSignal?.aborted !== true) {
            const target = elementRef.current!;
            target.classList.add("show", "showing");
            target.offsetHeight;
            target.classList.remove("showing");
        } else {
            dismiss();
        }

        if (dismissSignal?.aborted === false) {
            dismissSignal.addEventListener("abort", dismiss, { once: true });
            return () => dismissSignal.removeEventListener("abort", dismiss);
        }
    }, [dismissSignal, dismiss]);

    return <div ref={elementRef} className={`snackbar fade${className ? ` ${className}` : ""}`}
        role="alert" aria-live="assertive" aria-atomic="true" {...other}>
        {children}
        {actionText !== undefined ? <>
            <button className="btn" aria-label={actionText} onClick={action}>{actionText}</button>
            <button className="btn-close ms-auto" aria-label="Close" onClick={dismiss} />
        </> : undefined}
    </div>
}