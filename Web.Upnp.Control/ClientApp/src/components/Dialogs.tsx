import React, { ChangeEventHandler, PropsWithRef, RefObject } from "react";
import Modal, { ModalProps } from "./Modal";

type TextValueEditDialogProps = PropsWithRef<ModalProps<{
    label: string;
    confirmText?: string;
    inputRef?: RefObject<HTMLInputElement>;
    onConfirm?: (value: string) => void;
    onChanged?: ChangeEventHandler<HTMLInputElement>;
}>>;

export function TextValueEditDialog({ id, title, label, defaultValue, confirmText = "OK",
    onChanged, onConfirm, inputRef = React.createRef(), ...other }: TextValueEditDialogProps) {
    return <Modal id={id} title={title} {...other}>
        <div className="input-group mb-3">
            <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">{label}</span>
            </div>
            <input ref={inputRef} type="text" onChange={onChanged} className="form-control" defaultValue={defaultValue}
                placeholder="[provide value]" aria-label={label} aria-describedby="basic-addon1" />
        </div>
        <Modal.Footer>
            <Modal.Button key="cancel" className="btn-secondary" dismiss>Cancel</Modal.Button>
            <Modal.Button key="confirm" className="btn-primary" onClick={() => onConfirm?.(inputRef?.current?.value as string)} dismiss>{confirmText}</Modal.Button>
        </Modal.Footer>
    </Modal>;
}

type ConfirmationDialogProps = ModalProps<{
    confirmText?: string;
    onConfirm: () => void;
}>;

export function ConfirmationDialog({ id, title, confirmText = "OK", onConfirm, children, ...other }: ConfirmationDialogProps) {
    return <Modal id={id} title={title} {...other}>
        {children}
        <Modal.Footer>
            <Modal.Button key="cancel" className="btn-secondary" dismiss>Cancel</Modal.Button>
            <Modal.Button key="confirm" className="btn-primary" onClick={() => onConfirm()} dismiss>{confirmText}</Modal.Button>
        </Modal.Footer>
    </Modal>;
}