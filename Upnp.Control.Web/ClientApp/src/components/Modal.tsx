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
        var element = this.modalRef.current;
        if (element) {
            Array.from(element.querySelectorAll<HTMLElement>("[tabindex]"))
                .filter(({ tabIndex }) => tabIndex > 1)
                .sort((a, b) => a.tabIndex - b.tabIndex)
            [0]?.focus();
        }
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

        return <form tabIndex={-1} action="#" noValidate onSubmit={this.onSubmit}>
            <div className="modal fade" ref={this.modalRef} role="dialog" aria-hidden={true} {...other}>
                <div className={`modal-dialog modal-dialog-centered${className ? ` ${className}` : ""}`} role="document">
                    <div className="modal-content">
                        {header ? header : <Modal.Header><h5 className="modal-title text-truncate">{title}</h5></Modal.Header>}
                        {body ? body : <Modal.Body>{children}</Modal.Body>}
                        {footer ? footer : <Modal.Footer>
                            <Modal.Button className="dismiss" dismiss>Cancel</Modal.Button>
                            <Modal.Button className="confirm" type="submit" name="action" value="ok">Ok</Modal.Button>
                        </Modal.Footer>}
                    </div>
                </div>
            </div>
        </form>
    }

    static Button = ({ dismiss, className, icon, children, ...other }: { dismiss?: boolean; icon?: string } & ButtonHTMLAttributes<HTMLButtonElement>) =>
        <button type="button" className={`btn btn-plain text-uppercase p-2 py-1${className ? ` ${className}` : ""}`} data-bs-dismiss={dismiss ? "modal" : null} {...other}>
            {icon && <svg className="icon me-2"><use href={icon} /></svg>}{children}
        </button>;

    static Header = ({ className, children, ...other }: HTMLAttributes<HTMLDivElement>) =>
        <div className={`modal-header border-0${className ? ` ${className}` : ""}`} {...other}>
            {children}
            <button tabIndex={1} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>;

    static Body = ({ className, ...other }: HTMLAttributes<HTMLDivElement>) =>
        <div className={`modal-body${className ? ` ${className}` : ""}`} {...other}></div>;

    static Footer = ({ className, ...other }: HTMLAttributes<HTMLDivElement>) =>
        <div className={`modal-footer border-0 p-2${className ? ` ${className}` : ""}`} {...other}></div>;
};