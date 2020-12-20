import React, { ChangeEventHandler, PropsWithRef, RefObject } from "react";
import Modal, { ModalProps } from "./Modal";

type TextValueEditDialogProps = PropsWithRef<ModalProps<{
    label: string;
    confirmText?: string;
    required?: boolean;
    onConfirm?: (value: string) => void;
    onChanged?: ChangeEventHandler<HTMLInputElement>;
}>>;

export class TextValueEditDialog extends React.Component<TextValueEditDialogProps> {

    onSubmit = (data: FormData) => {
        this.props?.onConfirm?.(data.get("text-input") as string);
        return true;
    }

    render() {
        const { id, title, label, defaultValue, confirmText = "OK", required = true, onChanged, onConfirm, ...other } = this.props;
        return <Modal id={id} title={title} {...other} onSubmit={this.onSubmit}>
            <div className="input-group has-validation mb-3">
                <span className="input-group-text" id="basic-addon1">{label}</span>
                <input type="text" name="text-input" onChange={onChanged} className="form-control" defaultValue={defaultValue}
                    placeholder="[provide value]" aria-label={label} aria-describedby="basic-addon1" required={required} />
                <div className="invalid-tooltip">Non-empty value is required</div>
            </div>
            <Modal.Footer>
                <Modal.Button key="cancel" className="btn-secondary" dismiss>Cancel</Modal.Button>
                <Modal.Button key="confirm" className="btn-primary" type="submit">{confirmText}</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
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