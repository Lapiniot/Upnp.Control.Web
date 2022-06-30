import React from "react";
import Modal, { ModalProps } from "../../../../components/Modal";

type UploadPlaylistModalProps = ModalProps & {
    useProxy?: boolean;
    onAdd: (data: FormData) => void;
};

export class UploadPlaylistModal extends React.Component<UploadPlaylistModalProps> {

    style = { width: "60px" };

    onSubmit = (data: FormData) => {
        this.props.onAdd(data);
        return true;
    }

    render() {
        const { onAdd, useProxy, ...other } = this.props;
        return <Modal title="Upload playlist file" onSubmit={this.onSubmit} immediate {...other}>
            <input tabIndex={2} type="file" className="form-control" name="files" accept=".m3u,.m3u8" multiple required />
            <div className="invalid-feedback">Please select at least one playlist file</div>
            <div className="form-check form-switch px-0 mt-3">
                <input tabIndex={3} type="checkbox" defaultChecked={useProxy} className="form-check-input m-0 mx-2" name="useProxy" value="true" />
                <label htmlFor="useProxy" className="form-check-label">Use DLNA proxy</label>
            </div>
            <Modal.Footer>
                <Modal.Button tabIndex={5} dismiss>Cancel</Modal.Button>
                <Modal.Button tabIndex={4} className="text-primary" icon="symbols.svg#playlist_add" type="submit">Add</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}