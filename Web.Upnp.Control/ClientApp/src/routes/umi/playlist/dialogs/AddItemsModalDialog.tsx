import React from "react";
import Modal from "../../../../components/Modal";
import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";

export function AddItemsModalDialog({ onAdd, ...other }: BrowserDialogProps & { onAdd: (device: string, keys: string[]) => Promise<any> }) {
    return <BrowserDialog title="Select items to add" className="modal-lg modal-vh-80" immediate {...other}>
        {(b: BrowserDialog) => {
            const { device, keys } = b.getSelectionData();
            return [b.selection.any() &&
                <button type="button" key="counter" className="btn btn-link text-decoration-none me-auto px-0" onClick={b.selection.clear}>Clear selection</button>,
            <Modal.Button key="close" className="btn-secondary" dismiss>Close</Modal.Button>,
            <Modal.Button key="add" className="btn-primary" icon="plus" disabled={b.selection.none()} onClick={() => onAdd(device, keys).then(b.selection.clear)}>
                Add{b.selection.any() && <span className="badge ms-1 bg-secondary">{b.selection.length}</span>}
            </Modal.Button>];
        }}
    </BrowserDialog>;
}
