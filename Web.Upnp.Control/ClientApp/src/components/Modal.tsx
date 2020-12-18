import BootstrapModal from "bootstrap/js/dist/modal";
import React, { ButtonHTMLAttributes, FormEventHandler, HTMLAttributes, PropsWithChildren, ReactElement, ReactNode } from "react";

export type ModalProps<P = {}> = PropsWithChildren<P> & Omit<HTMLAttributes<HTMLDivElement>, "onSubmit"> & {
    id: string;
    immediate?: boolean;
    onDismiss?: EventListener;
    onShown?: EventListener;
    onSubmit?: (data: FormData) => boolean;
}

export default class Modal extends React.Component<ModalProps> {

    displayName = Modal.name;
    modal: BootstrapModal | null = null;

    componentDidMount() {
        const { onDismiss, onShown } = this.props;
        const target = document.querySelector(`#${this.props.id}`);

        if (!target) return;

        if (typeof onDismiss === "function")
            target.addEventListener("hidden.bs.modal", onDismiss);
        if (typeof onShown === "function")
            target.addEventListener("shown.bs.modal", onShown);

        this.modal = new BootstrapModal(target);
        if (this.props.immediate && this.modal)
            this.modal.show();
    }

    componentWillUnmount() {
        const { onDismiss, onShown } = this.props;
        const target = document.querySelector(`#${this.props.id}`);

        if (!target) return;

        if (typeof onDismiss === "function")
            target.removeEventListener("hidden.bs.modal", onDismiss);
        if (typeof onShown === "function")
            target.removeEventListener("shown.bs.modal", onShown);

        if (this.modal)
            this.modal.dispose();
    }

    onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        const form = e.currentTarget;

        e.preventDefault();
        e.stopPropagation();

        if (form.checkValidity()) {
            if (this.props.onSubmit?.(new FormData(form))) {
                this.dismiss();
            }
        }

        form.classList.add("was-validated");
    }

    dismiss = () => this.modal?.hide()

    render() {

        const { id, title, className, immediate, onDismiss, onShown, onSubmit, ...other } = this.props;

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
                    <form action="#" noValidate onSubmit={this.onSubmit}>
                        {header ? header : <Modal.Header>{title}</Modal.Header>}
                        {body ? body : <Modal.Body>{children}</Modal.Body>}
                        {footer ? footer : <Modal.Footer>
                            <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
                            <Modal.Button className="btn-primary" type="submit" name="action" value="ok">OK</Modal.Button>
                        </Modal.Footer>}
                    </form>
                </div>
            </div>
        </div >;
    }

    static Button = ({ dismiss, className, icon, children, ...other }:
        PropsWithChildren<{ dismiss?: boolean; icon?: string } & ButtonHTMLAttributes<HTMLButtonElement>>) =>
        <button type="button" className={`btn${className ? ` ${className}` : ""}`} data-bs-dismiss={dismiss ? "modal" : null} {...other}>
            {icon && <i className={`me-2 fas fa-${icon}`} />}{children}
        </button>;

    static Header = ({ className, children, ...other }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) =>
        <div className={`modal-header${className ? ` ${className}` : ""}`} {...other}>
            <h5 className="modal-title">{children}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>;

    static Body = ({ className, ...other }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) =>
        <div className={`modal-body${className ? ` ${className}` : ""}`} {...other}></div>;

    static Footer = ({ className, ...other }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) =>
        <div className={`modal-footer${className ? ` ${className}` : ""}`} {...other}></div>;
};