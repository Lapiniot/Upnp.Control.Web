import React from "react";
import Modal, { ModalProps } from "../../../../components/Modal";

type AddUrlModalProps = ModalProps & {
    feedUrl?: string;
    feedTitle?: string;
    useProxy?: boolean;
    onAdd: (url: string, title: string, useProxy: boolean) => void;
};

export class AddUrlModal extends React.Component<AddUrlModalProps> {
    style = { width: "60px" };

    onSubmit = (data: FormData): boolean => {
        this.props?.onAdd(data.get("feed-url") as string, data.get("feed-title") as string, data.get("use-proxy") === "on");
        return true;
    }

    render() {
        const { onAdd, feedUrl, feedTitle, useProxy, ...other } = this.props;
        return <Modal title="Provide url for media feed" onSubmit={this.onSubmit} immediate {...other}>
            <div className="input-group has-validation mb-3">
                <span className="input-group-text text-end d-inline" id="basic-addon1" style={this.style}>Url</span>
                <input type="url" defaultValue={feedUrl} className="form-control" name="feed-url" placeholder="[feed url]" pattern="http(s?)://.*" required
                    aria-label="Url" aria-describedby="basic-addon1" />
                <div className="invalid-tooltip">Please provide a valid feed url</div>
            </div>
            <div className="input-group mb-3">
                <span className="input-group-text text-end d-inline" id="basic-addon2" style={this.style}>Title</span>
                <input type="text" defaultValue={feedTitle} className="form-control" name="feed-title" placeholder="[feed title]"
                    aria-label="Title" aria-describedby="basic-addon2" />
            </div>
            <div className="form-check form-switch px-0">
                <input type="checkbox" defaultChecked={useProxy} className="form-check-input m-0 mx-2" name="use-proxy" id="use-dlna-proxy" />
                <label className="form-check-label" htmlFor="use-dlna-proxy">Use DLNA proxy for live stream</label>
            </div>
            <Modal.Footer>
                <Modal.Button className="dismiss" dismiss>Cancel</Modal.Button>
                <Modal.Button className="confirm" icon="plus" type="submit" name="action" value="add">Add</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}
