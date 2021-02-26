import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";

export function AddItemsModalDialog(props: BrowserDialogProps) {
    return <BrowserDialog title="Select items to add" className="modal-lg modal-fullscreen-sm-down" confirmText="Add" {...props}>
        {/* {({ keys }: { device: string, keys: string[] }) => {
            return [<Modal.Button key="close" className="dismiss" dismiss>Close</Modal.Button>,
            <Modal.Button key="add" className="confirm" icon="plus" disabled={!keys.length} onClick={clickHandler} dismiss>
                Add{keys.length ? <span className="badge rounded-pill ms-1 bg-secondary small">{keys.length}</span> : undefined}
            </Modal.Button>];
        }} */}
    </BrowserDialog>;
}
