import React from "react";
import Modal from "./Modal";

export function TextValueEditDialog({ id, title, label, defaultValue, confirmText = "OK", onValueChanged, onConfirm, inputRef = React.createRef(), ...other }) {
    return <Modal id={id} title={title} {...other}>
        <div className="input-group mb-3">
            <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">{label}</span>
            </div>
            <input ref={inputRef} type="text" onChange={onValueChanged} className="form-control" defaultValue={defaultValue}
                placeholder="[provide value]" aria-label={label} aria-describedby="basic-addon1" />
        </div>
        <Modal.Footer>
            <Modal.Button key="cancel" className="btn-secondary" dismiss>Cancel</Modal.Button>
            <Modal.Button key="confirm" className="btn-primary" onClick={() => onConfirm(inputRef.current.value)} dismiss>{confirmText}</Modal.Button>
        </Modal.Footer>
    </Modal>;
}

export function ConfirmationDialog({ id, title, confirmText = "OK", onConfirm, children, ...other }) {
    return <Modal id={id} title={title} {...other}>
        {children}
        <Modal.Footer>
            <Modal.Button key="cancel" className="btn-secondary" dismiss>Cancel</Modal.Button>
            <Modal.Button key="confirm" className="btn-primary" onClick={onConfirm} dismiss>{confirmText}</Modal.Button>
        </Modal.Footer>
    </Modal>;
}