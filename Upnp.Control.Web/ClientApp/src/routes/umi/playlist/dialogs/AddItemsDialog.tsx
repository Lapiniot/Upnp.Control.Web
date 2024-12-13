import { JSX } from "react";
import BrowserDialog, { BrowserDialogProps } from "../../../common/BrowserDialog";

function renderConfirmButton({ length }: Upnp.DIDL.Item[]): JSX.Element {
    return <>
        Add{length ? <span className="badge rounded-pill ms-1 text-bg-error small">{length}</span> : undefined}
    </>
}

export default function AddItemsDialog(props: BrowserDialogProps) {
    return <BrowserDialog title="Select items to add" confirmContent={renderConfirmButton} {...props} />
}