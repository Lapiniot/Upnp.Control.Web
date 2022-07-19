import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";
import { DIDLItem } from "../../../common/Types";

function renderConfirmButton({ length }: DIDLItem[]): JSX.Element {
    return <>
        <svg><use href="symbols.svg#add" /></svg>
        Add{length ? <span className="badge rounded-pill ms-1 bg-secondary small">{length}</span> : undefined}
    </>
}

export default function AddItemsDialog(props: BrowserDialogProps) {
    return <BrowserDialog title="Select items to add" confirmContent={renderConfirmButton} {...props} />
}