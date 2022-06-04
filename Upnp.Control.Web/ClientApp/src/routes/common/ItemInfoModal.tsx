import { useCallback } from "react";
import Modal, { ModalProps } from "../../components/Modal";
import { DIDLTools } from "./DIDLTools";
import { ItemInfo } from "./ItemInfo";
import { DIDLItem } from "./Types";

export default function ItemInfoModal({ item, ...other }: ModalProps & { item: DIDLItem; }) {
    const clickHandler = useCallback(() => navigator.permissions
        .query({ name: "clipboard-read" as PermissionName })
        .then(result => {
            if (result.state === "granted" || result.state === "prompt")
                navigator.clipboard.writeText(item.res?.url as string);
        }), []);

    return <Modal title={item.title} {...other} className="modal-fullscreen-sm-down modal-dialog-scrollable">
        <Modal.Body className="vstack">
            <ItemInfo item={item} />
        </Modal.Body>
        <Modal.Footer>
            {DIDLTools.isMediaItem(item) && window.isSecureContext
                ? <Modal.Button className="me-auto" onClick={clickHandler}>Copy media url</Modal.Button>
                : undefined}
            <Modal.Button tabIndex={2} className="text-primary" dismiss>Ok</Modal.Button>
        </Modal.Footer>
    </Modal>;
}