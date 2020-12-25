import React from "react";
import Modal, { ModalProps } from "../../../../components/Modal";

export class UploadPlaylistModalDialog extends React.Component<ModalProps & { onAdd: (data: FormData) => void }> {

    style = { width: "60px" };

    onSubmit = (data: FormData) => {
        this.props.onAdd(data);
        return true;
    }

    render() {
        const { onAdd, ...other } = this.props;
        return <Modal title="Upload playlist file" onSubmit={this.onSubmit} immediate {...other}>
            <div className="input-group has-validation mb-3">
                <input className="form-control" type="file" name="files" accept=".m3u,.m3u8" multiple required />
                <div className="invalid-tooltip">Please select at least one playlist file</div>
            </div>
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" name="useProxy" value="true" defaultChecked />
                <label className="form-check-label" htmlFor="useProxy">Use DLNA proxy for live stream</label>
            </div>
            <Modal.Footer>
                <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
                <Modal.Button className="btn-primary" icon="plus" type="submit">Add</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}