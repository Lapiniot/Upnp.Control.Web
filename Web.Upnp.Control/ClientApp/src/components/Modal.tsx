import BootstrapModal from "bootstrap/js/dist/modal";
import React, { ButtonHTMLAttributes, FormEventHandler, HTMLAttributes, ReactElement, ReactNode } from "react";

export type ModalProps<P = {}> = Omit<HTMLAttributes<HTMLDivElement>, "onSubmit"> & P & {
    immediate?: boolean;
    onDismissed?: EventListener;
    onShown?: EventListener;
    onSubmit?: (data: FormData) => boolean;
}

export default class Modal extends React.Component<ModalProps> {

    displayName = Modal.name;
    modal: BootstrapModal | null = null;
    activeElement: Element | null = null;
    modalRef = React.createRef<HTMLDivElement>();

    componentDidMount() {
        this.activeElement = document.activeElement;

        const target = this.modalRef.current;

        if (target) {
            target.addEventListener("hidden.bs.modal", this.onHidden);
            target.addEventListener("shown.bs.modal", this.onShown);
            this.modal = new BootstrapModal(target);
            if (this.props.immediate)
                this.modal.show();
        }
    }

    componentWillUnmount() {
        const target = this.modalRef.current;

        if (target) {
            target.removeEventListener("hidden.bs.modal", this.onHidden);
            target.removeEventListener("shown.bs.modal", this.onShown);
        }

        this.modal?.dispose();

        if (this.activeElement instanceof HTMLElement)
            (this.activeElement as HTMLElement).focus();
    }

    onHidden: EventListener = (event: Event) => {
        return this.props.onDismissed?.(event);
    }

    onShown: EventListener = (event: Event) => {
        return this.props.onShown?.(event);
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

        const { title, className, immediate, onDismissed, onShown, onSubmit: onSubmit, ...other } = this.props;

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

        return <div className="modal fade" tabIndex={-1} ref={this.modalRef} role="dialog" aria-hidden="true" {...other}>
            <div className={`modal-dialog modal-dialog-centered${className ? ` ${className}` : ""}`} role="document">
                <div className="modal-content">
                    <form action="#" noValidate onSubmit={this.onSubmit} className="d-flex flex-column flex-grow-1 overflow-hidden">
                        {header ? header : <Modal.Header>{title}</Modal.Header>}
                        {body ? body : <Modal.Body>{children}</Modal.Body>}
                        {footer ? footer : <Modal.Footer>
                            <Modal.Button className="dismiss" dismiss>Cancel</Modal.Button>
                            <Modal.Button className="confirm" type="submit" name="action" value="ok">Ok</Modal.Button>
                        </Modal.Footer>}
                    </form>
                </div>
            </div>
        </div >;
    }

    static Button = ({ dismiss, className, icon, children, ...other }: { dismiss?: boolean; icon?: string } & ButtonHTMLAttributes<HTMLButtonElement>) =>
        <button type="button" className={`btn btn-plain text-uppercase p-2 py-1${className ? ` ${className}` : ""}`} data-bs-dismiss={dismiss ? "modal" : null} {...other}>
            {icon && <svg className="icon me-2"><use href={`#${icon}`} /></svg>}{children}
        </button>;

    static Header = ({ className, children, ...other }: HTMLAttributes<HTMLDivElement>) =>
        <div className={`modal-header border-0${className ? ` ${className}` : ""}`} {...other}>
            <h5 className="modal-title text-truncate">{children}</h5>
            <button type="button" className="btn-close" tabIndex={200} data-bs-dismiss="modal" aria-label="Close" />
        </div>;

    static Body = ({ className, ...other }: HTMLAttributes<HTMLDivElement>) =>
        <div className={`modal-body${className ? ` ${className}` : ""}`} {...other}></div>;

    static Footer = ({ className, ...other }: HTMLAttributes<HTMLDivElement>) =>
        <div className={`modal-footer border-0 p-2${className ? ` ${className}` : ""}`} {...other}></div>;
};