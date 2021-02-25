import { DIDLItem } from "./Types";
import Modal, { ModalProps } from "../../components/Modal";

export default function ItemInfoDialog({ item, ...other }: ModalProps & { item: DIDLItem; }) {
    return <Modal title={item.title} {...other} className="modal-fullscreen-sm-down">
        <code>{JSON.stringify(item)}</code>
        <Modal.Footer>
            <Modal.Button className="confirm" dismiss>Ok</Modal.Button>
        </Modal.Footer>
    </Modal>;
}