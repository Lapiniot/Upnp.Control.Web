import Modal, { ModalProps } from "../../../../components/Modal";

export function RemoveItemsModalDialog({ onRemove, children, ...other }: ModalProps & { onRemove: () => void; }) {
    return <Modal title="Do you want to remove items from the playlist?" immediate {...other}>
        {children}
        <Modal.Footer>
            <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
            <Modal.Button className="btn-danger" icon="trash" onClick={onRemove} dismiss>Remove</Modal.Button>
        </Modal.Footer>
    </Modal>;
}
