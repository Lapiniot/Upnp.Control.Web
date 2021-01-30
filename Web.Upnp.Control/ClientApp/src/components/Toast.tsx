import React, { HTMLAttributes } from "react";
import BootstrapToast from "bootstrap/js/dist/toast";

export type ToastProps = HTMLAttributes<HTMLDivElement> & {
    header?: string;
    hint?: string;
    color?: "primary" | "secondary" | "success" | "info" | "warning" | "danger" | "light" | "dark";
    autohide?: boolean;
    animation?: boolean;
    delay?: number;
    onDismiss?: (element: HTMLDivElement) => void;
};

export class Toast extends React.Component<ToastProps> {

    toast: BootstrapToast | null = null;

    #initialize = (element: HTMLDivElement) => {
        if (element) {
            this.toast = new BootstrapToast(element);
            element.addEventListener("hidden.bs.toast", this.#onDismiss);
            (this.toast as any).show();
        }
        else {
            this.toast?.dispose();
        }
    }

    #onDismiss: EventListener = (e) => this.props.onDismiss?.(e.target as HTMLDivElement);

    render() {
        const { header, hint, color, children, autohide, animation, delay, className, onDismiss, ...other } = this.props;
        return <div ref={this.#initialize} className={`toast${className ? ` ${className}` : ""}`} role="alert" aria-live="assertive" aria-atomic="true"
            data-bs-autohide={autohide} data-bs-animation={animation} data-bs-delay={delay} {...other}>
            <div className="toast-header">
                {color &&
                    <svg className={`me-2 icon text-${color}`} viewBox="0 0 16 16" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false">
                        <circle cx="50%" cy="50%" r="50%" />
                    </svg>}
                <strong className="me-auto">{header}</strong>
                {hint && <small>{hint}</small>}
                <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" />
            </div>
            <div className="toast-body">{children}</div>
        </div>;
    }
}