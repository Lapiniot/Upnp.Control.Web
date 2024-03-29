import { ComponentPropsWithRef, useCallback, useMemo } from "react";
import Dialog from "../../components/Dialog";
import { isMediaItem } from "./DIDLTools";
import { ItemInfo } from "./ItemInfo";

export default function ItemInfoDialog({ item, ...other }: ComponentPropsWithRef<typeof Dialog> & { item: Upnp.DIDL.Item; }) {
    const clickHandler = useCallback(() => navigator.permissions
        .query({ name: "clipboard-read" as PermissionName })
        .then(result => {
            if (result.state === "granted" || result.state === "prompt")
                navigator.clipboard.writeText(item.res?.url as string);
        }), [item]);

    const actions = useMemo(() => <>
        {isMediaItem(item) && isSecureContext
            && <Dialog.Button type="button" className="me-auto" onClick={clickHandler}>Copy media url</Dialog.Button>}
        <Dialog.Button value="ok" className="text-primary" autoFocus>OK</Dialog.Button>
    </>, [item, clickHandler]);

    return <Dialog caption={item.title} {...other} className="dialog-lg dialog-fullscreen-sm-down dialog-scrollable" actions={actions}>
        <ItemInfo item={item} />
    </Dialog>
}