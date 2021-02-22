import React from "react";
import Modal, { ModalProps } from "../../../../components/Modal";

type UploadPlaylistModalDialogProps = {
    useProxy?: boolean;
    onAdd: (data: FormData) => void;
};

export class UploadPlaylistModalDialog extends React.Component<ModalProps & UploadPlaylistModalDialogProps> {

    style = { width: "60px" };

    onSubmit = (data: FormData) => {
        this.props.onAdd(data);
        return true;
    }

    render() {
        const { onAdd, useProxy, ...other } = this.props;
        return <Modal title="Upload playlist file" onSubmit={this.onSubmit} immediate {...other}>
            <div className="input-group has-validation mb-3">
                <input type="file" className="form-control" name="files" accept=".m3u,.m3u8" multiple required />
                <div className="invalid-tooltip">Please select at least one playlist file</div>
            </div>
            <div className="form-check form-switch">
                <input type="checkbox" defaultChecked={useProxy} className="form-check-input" name="useProxy" value="true" />
                <label htmlFor="useProxy" className="form-check-label" >Use DLNA proxy for live stream</label>
            </div>
            <Modal.Footer>
                <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
                <Modal.Button className="btn-primary" icon="plus" type="submit">Add</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}