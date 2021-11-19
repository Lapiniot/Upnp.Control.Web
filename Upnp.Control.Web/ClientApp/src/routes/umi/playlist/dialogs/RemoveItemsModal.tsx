import Modal, { ModalProps } from "../../../../components/Modal";

export function RemoveItemsModal({ onRemove, children, className, ...other }: ModalProps & { onRemove: () => void; }) {
    return <Modal title="Do you want to remove items from the playlist?" className={`modal-dialog-scrollable${className ? ` ${className}` : ""}`} {...other}>
        {children}
        <Modal.Footer>
            <Modal.Button className="dismiss" dismiss>Cancel</Modal.Button>
            <Modal.Button className="destructive" icon="trash" onClick={onRemove} dismiss>Remove</Modal.Button>
        </Modal.Footer>
    </Modal>;
}
