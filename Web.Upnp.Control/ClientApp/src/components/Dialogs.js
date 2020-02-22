import React from "react";
import Modal from "./Modal";

export class TextValueEditDialog extends React.Component {
    displayName = TextValueEditDialog.name;

    render() {
        const { id, title, label, defaultValue, confirmText = "OK", onValueChanged, onConfirm, ...other } = this.props;

        return <Modal id={id} title={title} {...other}>
                   <div className="input-group mb-3">
                       <div className="input-group-prepend">
                           <span className="input-group-text" id="basic-addon1">{label}</span>
                       </div>
                       <input type="text" onChange={onValueChanged} className="form-control" defaultValue={defaultValue}
                              placeholder="[provide value]" aria-label={label} aria-describedby="basic-addon1" />
                   </div>
                   <Modal.Footer>
                       <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />
                       <Modal.Button key="confirm" text={confirmText} className="btn-primary" onClick={onConfirm} dismiss />
                   </Modal.Footer>
               </Modal>;
    }
}

export class ConfirmationDialog extends React.Component {
    displayName = ConfirmationDialog.name;

    render() {
        const { id, title, confirmText = "OK", onConfirm, ...other } = this.props;

        return <Modal id={id} title={title} {...other}>
                   {this.props.children}
                   <Modal.Footer>
                       <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />
                       <Modal.Button key="confirm" text={confirmText} className="btn-primary" onClick={onConfirm} dismiss />
                   </Modal.Footer>
               </Modal>;
    }
}