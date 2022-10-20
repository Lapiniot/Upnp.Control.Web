import { useCallback } from "react";
import Dialog, { DialogProps } from "../../components/Dialog";
import { isMediaItem } from "./DIDLTools";
import { ItemInfo } from "./ItemInfo";

export default function ItemInfoDialog({ item, ...other }: DialogProps & { item: Upnp.DIDL.Item; }) {
    const clickHandler = useCallback(() => navigator.permissions
        .query({ name: "clipboard-read" as PermissionName })
        .then(result => {
            if (result.state === "granted" || result.state === "prompt")
                navigator.clipboard.writeText(item.res?.url as string);
        }), [item]);

    const renderFooter = useCallback(() => <Dialog.Footer>
        {isMediaItem(item) && isSecureContext
            && <Dialog.Button type="button" className="me-auto" onClick={clickHandler}>Copy media url</Dialog.Button>}
        <Dialog.Button value="ok" className="text-primary" autoFocus>OK</Dialog.Button>
    </Dialog.Footer>, [item]);

    return <Dialog caption={item.title} {...other} className="dialog-fullscreen-sm-down dialog-scrollable" renderFooter={renderFooter}>
        <Dialog.Body className="vstack">
            <ItemInfo item={item} />
        </Dialog.Body>
    </Dialog>
}