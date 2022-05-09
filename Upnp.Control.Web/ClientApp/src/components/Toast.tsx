import React, { HTMLAttributes } from "react";
import BootstrapToast from "bootstrap/js/dist/toast";
import { ThemeColors } from "../routes/common/Types";

export type ToastProps = HTMLAttributes<HTMLDivElement> & {
    header?: string;
    hint?: string;
    color?: ThemeColors;
    autohide?: boolean;
    animation?: boolean;
    delay?: number;
    onDismissed?: (element: HTMLDivElement) => void;
};

export class Toast extends React.Component<ToastProps> {

    toast: BootstrapToast | null = null;

    private initialize = (element: HTMLDivElement) => {
        if (element) {
            this.toast = new BootstrapToast(element);
            element.addEventListener("hidden.bs.toast", this.onDismiss);
            (this.toast as any).show();
        }
        else {
            this.toast?.dispose();
        }
    }

    private onDismiss: EventListener = (e: Event) => this.props.onDismissed?.(e.target as HTMLDivElement);

    render() {
        const { header, hint, color, children, autohide, animation, delay, className, onDismissed, ...other } = this.props;
        return <div ref={this.initialize} className={`toast${className ? ` ${className}` : ""}`} role="alert" aria-live="assertive" aria-atomic="true"
            data-bs-autohide={autohide} data-bs-animation={animation} data-bs-delay={delay} {...other}>
            <div className="toast-header">
                {color &&
                    <svg className={`me-2 flex-shrink-0 icon text-${color}`} viewBox="0 0 16 16" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false">
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