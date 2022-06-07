import React, { ChangeEventHandler, PropsWithRef } from "react";
import Modal, { ModalProps } from "./Modal";

type TextValueEditDialogProps = PropsWithRef<ModalProps<{
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
        const { title, defaultValue, confirmText = "OK", required = true, onChanged, onConfirmed, ...other } = this.props;
        return <Modal title={title} {...other} onSubmit={this.onSubmit}>
            <input tabIndex={2} type="text" name="text-input" onChange={onChanged} className="form-control" defaultValue={defaultValue}
                placeholder="[provide value]" required={required} />
            <div className="invalid-feedback">Non-empty value is required</div>
            <Modal.Footer>
                <Modal.Button tabIndex={4} key="cancel" dismiss>Cancel</Modal.Button>
                <Modal.Button tabIndex={3} key="confirm" className="text-primary" type="submit">{confirmText}</Modal.Button>
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
            <Modal.Button key="cancel" dismiss>Cancel</Modal.Button>
            <Modal.Button key="confirm" className="text-primary" onClick={() => onConfirmed()} dismiss>{confirmText}</Modal.Button>
        </Modal.Footer>
    </Modal>;
}