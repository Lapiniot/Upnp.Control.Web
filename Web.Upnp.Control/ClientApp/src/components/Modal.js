import $ from "./jQuery";
import "bootstrap";
import React from "react";
import { mergeClassNames as merge } from "./Extensions";

export default class Modal extends React.Component {

    displayName = Modal.name;

    componentDidUpdate() {
        this.showModal();
    }

    componentDidMount() {
        const modal = $(`#${this.props.id}`);
        const { onDismiss, onShown } = this.props;

        if (onDismiss && typeof onDismiss === "function") modal.on("hidden.bs.modal", onDismiss);

        if (onShown && typeof onShown === "function") modal.on("shown.bs.modal", onShown);

        this.showModal();
    }

    componentWillUnmount() {
        const modal = $(`#${this.props.id}`);
        const { onDismiss, onShown } = this.props;

        if (onDismiss && typeof onDismiss === "function") modal.off("hidden.bs.modal", onDismiss);

        if (onShown && typeof onShown === "function") modal.off("shown.bs.modal", onShown);
    }

    showModal() {
        if (this.props.immediate) {
            $(`#${this.props.id}`).modal("show");
        }
    }

    render() {

        const { id, immediate, area, title, onDismiss, onShown, className,
            renderHeader, renderBody, renderFooter,
            area: { label: areaLabel, hidden: areaHidden = true } = {},
            ...other } = this.props;

        let header, body, footer;
        const rest = [];
        React.Children.map(this.props.children,
            c => {
                if (c.type === Modal.Header) header = c;
                else if (c.type === Modal.Body) body = c;
                else if (c.type === Modal.Footer) footer = c;
                else rest.push(c);
            });

        return <div className={merge`modal fade ${className}`} id={id} tabIndex="-1" role="dialog" aria-labelledby={areaLabel} aria-hidden={areaHidden} {...other}>
                   <div className="modal-dialog modal-dialog-centered" role="document">
                       <div className="modal-content">
                           {!!header ? header : <Modal.Header>{title}</Modal.Header>}
                           {!!body ? body : <Modal.Body>{typeof renderBody === "function" ? renderBody() : rest}</Modal.Body>}
                           {!!footer ? footer : <Modal.Footer>{typeof renderFooter === "function" ? renderFooter() : [this.props.buttons]}</Modal.Footer>}
                       </div>
                   </div>
               </div>;
    }

    static Button = class extends React.Component {
        render() {
            const { dismiss, text, className, ...other } = this.props;
            return <button type="button" className={merge`btn ${className}`} data-dismiss={dismiss ? "modal" : null} {...other}>{text}</button>;
        }
    };

    static Header = class extends React.Component {
        render() {
            const { className, ...other } = this.props;
            return <div className={merge`modal-header ${className}`} {...other}>
                       <h5 className="modal-title">{this.props.children}</h5>
                       <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                           <span aria-hidden="true">&times;</span>
                       </button>
                   </div>;
        }
    };

    static Body = class extends React.Component {
        render() {
            const { className, ...other } = this.props;
            return <div className={merge`modal-body ${className}`} {...other}>
                       {this.props.children}
                   </div>;
        }
    };

    static Footer = class extends React.Component {
        render() {
            const { className, ...other } = this.props;
            return <div className={merge`modal-footer ${className}`} {...other}>
                       {this.props.children}
                   </div>;
        }
    };
};