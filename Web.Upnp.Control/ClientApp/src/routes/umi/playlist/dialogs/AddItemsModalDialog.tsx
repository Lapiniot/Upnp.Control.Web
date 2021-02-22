import { useMemo } from "react";
import Modal from "../../../../components/Modal";
import SelectionService from "../../../../components/SelectionService";
import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";

export function AddItemsModalDialog({ onAdd, ...other }: BrowserDialogProps & { onAdd: (device: string, keys: string[]) => Promise<any> }) {
    const selection = useMemo(() => new SelectionService(), []);
    return <BrowserDialog selection={selection} title="Select items to add" className="modal-lg modal-fullscreen-sm-down" immediate {...other}>
        {({ device, keys }: { device: string, keys: string[] }) => {
            return [<Modal.Button key="close" className="dismiss" dismiss>Close</Modal.Button>,
            <Modal.Button key="add" className="confirm" icon="plus" disabled={!keys.length} onClick={() => onAdd(device, keys).then(selection.clear)}>
                Add{keys.length ? <span className="badge rounded-pill ms-1 bg-secondary small">{keys.length}</span> : undefined}
            </Modal.Button>];
        }}
    </BrowserDialog>;
}
