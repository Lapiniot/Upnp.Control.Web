import Modal from "../../../../components/Modal";
import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";

export function AddItemsModalDialog({ onAdd, ...other }: BrowserDialogProps & { onAdd: (device: string, keys: string[]) => Promise<any> }) {
    return <BrowserDialog title="Select items to add" className="modal-lg modal-vh-80" immediate {...other}>
        {(b: BrowserDialog) => {
            const { device, keys } = b.getSelectionData();
            return [keys.length ? <button type="button" key="counter" className="btn btn-link text-decoration-none me-auto px-0" onClick={b.clearSelection}>Clear selection</button> : undefined,
            <Modal.Button key="close" className="btn-secondary" dismiss>Close</Modal.Button>,
            <Modal.Button key="add" className="btn-primary" icon="plus" disabled={!keys.length} onClick={() => onAdd(device, keys).then(b.clearSelection)}>
                Add{keys.length ? <span className="badge ms-1 bg-secondary">{keys.length}</span> : undefined}
            </Modal.Button>];
        }}
    </BrowserDialog>;
}
