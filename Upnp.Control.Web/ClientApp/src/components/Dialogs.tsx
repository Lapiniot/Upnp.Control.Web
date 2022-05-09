import React, { ChangeEventHandler, PropsWithRef } from "react";
import Modal, { ModalProps } from "./Modal";

type TextValueEditDialogProps = PropsWithRef<ModalProps<{
    label: string;
    confirmText?: string;
    required?: boolean;
    onConfirmed?: (value: string) => void;
    onChanged?: ChangeEventHandler<HTMLInputElement>;
}>>;

export class TextValueEditDialog extends React.Component<TextValueEditDialogProps> {

    onSubmit = (data: FormData) => {
        this.props?.onConfirmed?.(data.get("text-input") as string);
        return true;
    }

    render() {
        const { title, label, defaultValue, confirmText = "OK", required = true, onChanged, onConfirmed, ...other } = this.props;
        return <Modal title={title} {...other} onSubmit={this.onSubmit}>
            <div className="input-group has-validation mb-3">
                <span className="input-group-text" id="basic-addon1">{label}</span>
                <input tabIndex={2} type="text" name="text-input" onChange={onChanged} className="form-control" defaultValue={defaultValue}
                    placeholder="[provide value]" aria-label={label} aria-describedby="basic-addon1" required={required} />
                <div className="invalid-tooltip">Non-empty value is required</div>
            </div>
            <Modal.Footer>
                <Modal.Button tabIndex={4} key="cancel" className="dismiss" dismiss>Cancel</Modal.Button>
                <Modal.Button tabIndex={3} key="confirm" className="confirm" type="submit">{confirmText}</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}

type ConfirmationDialogProps = ModalProps<{
    confirmText?: string;
    onConfirmed: () => void;
}>;

export function ConfirmationDialog({ title, confirmText = "OK", onConfirmed, children, ...other }: ConfirmationDialogProps) {
    return <Modal title={title} {...other}>
        {children}
        <Modal.Footer>
            <Modal.Button key="cancel" className="dismiss" dismiss>Cancel</Modal.Button>
            <Modal.Button key="confirm" className="confirm" onClick={() => onConfirmed()} dismiss>{confirmText}</Modal.Button>
        </Modal.Footer>
    </Modal>;
}