import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";

function renderConfirmButton({ length }: Upnp.DIDL.Item[]): JSX.Element {
    return <>
        <svg><use href="symbols.svg#add" /></svg>
        Add{length ? <span className="badge rounded-pill ms-1 bg-secondary small">{length}</span> : undefined}
    </>
}

export default function AddItemsDialog(props: BrowserDialogProps) {
    return <BrowserDialog title="Select items to add" confirmContent={renderConfirmButton} {...props} />
}