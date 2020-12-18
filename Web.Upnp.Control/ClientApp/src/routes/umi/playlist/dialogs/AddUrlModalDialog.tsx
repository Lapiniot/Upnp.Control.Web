import React from "react";
import Modal, { ModalProps } from "../../../../components/Modal";

export class AddUrlModalDialog extends React.Component<ModalProps & { onAdd: (url: string, title: string, useProxy: boolean) => void }> {
    style = { width: "60px" };

    onSubmit = (data: FormData): boolean => {
        this.props?.onAdd(data.get("feed-url") as string, data.get("feed-title") as string, data.get("use-proxy") === "on");
        return true;
    }

    render() {
        const { onAdd, ...other } = this.props;
        return <Modal title="Provide url for media feed" onSubmit={this.onSubmit} immediate {...other}>
            <div className="input-group has-validation mb-3">
                <span className="input-group-text text-end d-inline" id="basic-addon1" style={this.style}>Url</span>
                <input type="url" className="form-control" name="feed-url" placeholder="[provide value]" pattern="http(s?)://.*" required
                    aria-label="Url" aria-describedby="basic-addon1" />
                <div className="invalid-tooltip">Please provide a valid feed url</div>
            </div>
            <div className="input-group mb-3">
                <span className="input-group-text text-end d-inline" id="basic-addon2" style={this.style}>Title</span>
                <input type="text" className="form-control" name="feed-title" placeholder="[provide value]" aria-label="Title" aria-describedby="basic-addon2" />
            </div>
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" name="use-proxy" id="use-dlna-proxy" defaultChecked />
                <label className="form-check-label" htmlFor="use-dlna-proxy">Use DLNA proxy for live stream</label>
            </div>
            <Modal.Footer>
                <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
                <Modal.Button className="btn-primary" icon="plus" type="submit" name="action" value="add">Add</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}
