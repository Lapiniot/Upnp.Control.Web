import { DIDLItem } from "./Types";
import Modal, { ModalProps } from "../../components/Modal";
import { DIDLUtils } from "./BrowserUtils";
import { useCallback } from "react";
import { ItemInfo } from "./ItemInfo";

export default function ItemInfoModal({ item, ...other }: ModalProps & { item: DIDLItem; }) {
    const clickHandler = useCallback(() => navigator.permissions
        .query({ name: "clipboard-write" })
        .then(result => {
            if (result.state === "granted" || result.state === "prompt")
                navigator.clipboard.writeText(item.res?.url as string);
        }), []);

    return <Modal title={item.title} {...other} className="modal-fullscreen-sm-down modal-dialog-scrollable">
        <Modal.Body className="d-flex flex-column">
            <ItemInfo item={item} />
        </Modal.Body>
        <Modal.Footer>
            {DIDLUtils.isMediaItem(item) && window.isSecureContext ? <Modal.Button className="me-auto" onClick={clickHandler}>Copy media url</Modal.Button> : undefined}
            <Modal.Button className="confirm" dismiss>Ok</Modal.Button>
        </Modal.Footer>
    </Modal>;
}