import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";

function renderConfirmButton(ids: string[]): JSX.Element {
    return <>Add{ids.length ? <span className="badge rounded-pill ms-1 bg-secondary small">{ids.length}</span> : undefined}</>
}

export function AddItemsModal(props: BrowserDialogProps) {
    return <BrowserDialog title="Select items to add" className="modal-lg modal-fullscreen-sm-down"
        confirmContent={renderConfirmButton} {...props} />
}