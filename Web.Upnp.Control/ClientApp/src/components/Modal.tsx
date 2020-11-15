import BootstrapModal from "bootstrap/js/dist/modal";
import React, { HTMLAttributes, PropsWithChildren, ReactElement, ReactNode } from "react";

type ModalProps = PropsWithChildren<{
    immediate?: boolean;
    onDismiss: EventListener;
    onShown: EventListener;
    buttons: ReactNode;
} & HTMLAttributes<HTMLDivElement>>;

export default class Modal extends React.Component<ModalProps> {

    displayName = Modal.name;

    componentDidMount() {
        const { onDismiss, onShown } = this.props;
        const target = document.querySelector(`#${this.props.id}`);

        if (!target) return;

        if (typeof onDismiss === "function")
            target.addEventListener("hidden.bs.modal", onDismiss);
        if (typeof onShown === "function")
            target.addEventListener("shown.bs.modal", onShown);

        const modal = new BootstrapModal(target);
        if (this.props.immediate)
            modal.show();
    }

    componentWillUnmount() {
        const { onDismiss, onShown } = this.props;
        const target = document.querySelector(`#${this.props.id}`);

        if (!target) return;

        if (typeof onDismiss === "function")
            target.removeEventListener("hidden.bs.modal", onDismiss);
        if (typeof onShown === "function")
            target.removeEventListener("shown.bs.modal", onShown);

        const modal = BootstrapModal.getInstance(target);
        modal.dispose();
    }

    render() {

        const { id, title, className, immediate, onDismiss, onShown, buttons, ...other } = this.props;

        let header, body, footer;
        const children: ReactNode[] = [];
        React.Children.map(this.props.children,
            child => {
                const reactElement = child as ReactElement;
                if (reactElement) {
                    if (reactElement.type === Modal.Header) header = reactElement;
                    else if (reactElement.type === Modal.Body) body = reactElement;
                    else if (reactElement.type === Modal.Footer) footer = reactElement;
                    else children.push(reactElement);
                }
                else children.push(child);
            });

        return <div className="modal fade" id={id} tabIndex={-1} role="dialog" aria-hidden="true" {...other}>
            <div className={`modal-dialog modal-dialog-centered${className ? ` ${className}` : ""}`} role="document">
                <div className="modal-content">
                    {header ? header : <Modal.Header>{title}</Modal.Header>}
                    {body ? body : <Modal.Body>{children}</Modal.Body>}
                    {footer ? footer : <Modal.Footer>{buttons}</Modal.Footer>}
                </div>
            </div>
        </div>;
    }

    static Button = ({ dismiss, className, icon, children, ...other }:
        PropsWithChildren<{ dismiss?: boolean; icon?: string } & HTMLAttributes<HTMLButtonElement>>) =>
        <button type="button" className={`btn${className ? ` ${className}` : ""}`} data-dismiss={dismiss ? "modal" : null} {...other}>
            {icon && <i className={`mr-2 fas fa-${icon}`} />}{children}
        </button>;

    static Header = ({ className, children, ...other }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) =>
        <div className={`modal-header${className ? ` ${className}` : ""}`} {...other}>
            <h5 className="modal-title">{children}</h5>
            <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" />
        </div>;

    static Body = ({ className, ...other }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) =>
        <div className={`modal-body${className ? ` ${className}` : ""}`} {...other}></div>;

    static Footer = ({ className, ...other }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) =>
        <div className={`modal-footer${className ? ` ${className}` : ""}`} {...other}></div>;
};