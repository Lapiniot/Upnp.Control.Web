import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";
import { DIDLItem } from "../../../common/Types";

function renderConfirmButton({ length }: DIDLItem[]): JSX.Element {
    return <>
        <svg><use href="sprites.svg#plus" /></svg>
        Add{length ? <span className="badge rounded-pill ms-1 bg-secondary small">{length}</span> : undefined}
    </>
}

export function AddItemsModal(props: BrowserDialogProps) {
    return <BrowserDialog title="Select items to add" className="modal-lg modal-fullscreen-sm-down"
        confirmContent={renderConfirmButton} {...props} />
}