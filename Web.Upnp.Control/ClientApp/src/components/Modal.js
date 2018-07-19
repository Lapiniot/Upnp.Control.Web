import $ from "./common/jQuery";
import "bootstrap";
import React from "react";

export default class Modal extends React.Component {

    displayName = Modal.name;

    componentDidUpdate() {
        this.showModal();
    }

    componentDidMount() {
        this.showModal();
    }

    showModal() {
        if (this.props.immidiate) {
            $(`#${this.props.id}`).modal("show");
        }
    }

    render() {

        const { id, immidiate, area, title, area: { label: areaLabel, hidden: areaHidden = true } = {}, ...other } = this.props;

        return <React.Fragment>
                   <div className="modal fade" id={id} tabIndex="-1" role="dialog" aria-labelledby={areaLabel} aria-hidden={areaHidden} {...other}>
                       <div className="modal-dialog modal-dialog-centered" role="document">
                           <div className="modal-content">
                               <div className="modal-header">
                                   <h5 className="modal-title" id="exampleModalCenterTitle">{title}</h5>
                                   <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                       <span aria-hidden="true">&times;</span>
                                   </button>
                               </div>
                               <div className="modal-body">
                                   {typeof this.props.renderBody === "function" ? this.props.renderBody() : this.props.children}
                               </div>
                               <div className="modal-footer">
                                   {typeof this.props.renderFooter === "function"
                                       ? this.props.renderFooter()
                                       : [this.props.buttons]}
                               </div>
                           </div>
                       </div>
                   </div>
               </React.Fragment>;
    }
}

Modal.Button = class extends React.Component {
    render() {
        const { dismiss, text, ...other } = this.props;
        return <button type="button" className="btn" data-dismiss={dismiss ? "modal" : null} {...other}>{text}</button>;
    }
};