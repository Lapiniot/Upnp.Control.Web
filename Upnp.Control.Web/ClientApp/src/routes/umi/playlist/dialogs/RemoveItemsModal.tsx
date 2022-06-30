import Modal, { ModalProps } from "../../../../components/Modal";

export function RemoveItemsModal({ onRemove, children, className, ...other }: ModalProps & { onRemove: () => void; }) {
    return <Modal title="Do you want to remove items from the playlist?" className={`modal-dialog-scrollable${className ? ` ${className}` : ""}`} {...other}>
        {children}
        <Modal.Footer>
            <Modal.Button tabIndex={2} dismiss>Cancel</Modal.Button>
            <Modal.Button tabIndex={3} className="text-danger" icon="symbols.svg#delete" onClick={onRemove} dismiss>Remove</Modal.Button>
        </Modal.Footer>
    </Modal>;
}
