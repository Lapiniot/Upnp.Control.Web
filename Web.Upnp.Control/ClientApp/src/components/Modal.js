import BootstrapModal from "bootstrap/js/dist/modal";
import React from "react";
import { mergeClassNames as merge } from "./Extensions";

export default class Modal extends React.Component {

    displayName = Modal.name;

    componentDidMount() {
        const { onDismiss, onShown } = this.props;
        const target = document.querySelector(`#${this.props.id}`);

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

        if (typeof onDismiss === "function")
            target.removeEventListener("hidden.bs.modal", onDismiss);
        if (typeof onShown === "function")
            target.removeEventListener("shown.bs.modal", onShown);

        const modal = BootstrapModal.getInstance(target);
        modal.dispose();
    }

    render() {

        const { id, title, className, immediate, area = {}, onDismiss, onShown, ...other } = this.props;

        let header, body, footer;
        const children = [];
        React.Children.map(this.props.children,
            c => {
                if (c.type === Modal.Header) header = c;
                else if (c.type === Modal.Body) body = c;
                else if (c.type === Modal.Footer) footer = c;
                else children.push(c);
            });

        return <div className="modal fade" id={id} tabIndex="-1" role="dialog" aria-labelledby={area.label} aria-hidden="true" {...other}>
            <div className={merge`modal-dialog modal-dialog-centered ${className}`} role="document">
                <div className="modal-content">
                    {!!header ? header : <Modal.Header>{title}</Modal.Header>}
                    {!!body ? body : <Modal.Body>{children}</Modal.Body>}
                    {!!footer ? footer : <Modal.Footer>{[this.props.buttons]}</Modal.Footer>}
                </div>
            </div>
        </div>;
    }

    static Button = ({ dismiss, text, className, icon, children, ...other }) =>
        <button type="button" className={merge`btn ${className}`} data-dismiss={dismiss ? "modal" : null} {...other}>{icon && <i className={`mr-2 fas fa-${icon}`} />}{text}{children}</button>;

    static Header = ({ className, children, ...other }) =>
        <div className={merge`modal-header ${className}`} {...other}>
            <h5 className="modal-title">{children}</h5>
            <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close" />
        </div>;

    static Body = ({ className, children, ...other }) => <div className={merge`modal-body ${className}`} {...other}>{children}</div>;

    static Footer = ({ className, children, ...other }) => <div className={merge`modal-footer ${className}`} {...other}>{children}</div>;
};