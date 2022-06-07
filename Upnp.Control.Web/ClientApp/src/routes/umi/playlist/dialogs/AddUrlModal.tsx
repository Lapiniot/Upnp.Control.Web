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
            <div className="form-floating mb-3">
                <input type="url" name="feed-url" className="form-control" tabIndex={2} defaultValue={feedUrl}
                    placeholder="feed url" required pattern="http(s?)://.*" aria-label="Url" />
                <label htmlFor="feed-url">Feed url</label>
                <div className="invalid-feedback">Please provide a valid feed url</div>
            </div>
            <div className="form-floating mb-3">
                <input type="text" name="feed-title" className="form-control" tabIndex={3} defaultValue={feedTitle}
                    placeholder="feed title" aria-label="Title" />
                <label htmlFor="feed-title">Title</label>
            </div>
            <div className="form-check form-switch px-0">
                <input tabIndex={4} type="checkbox" defaultChecked={useProxy} className="form-check-input m-0 mx-2" name="use-proxy" id="use-dlna-proxy" />
                <label className="form-check-label" htmlFor="use-dlna-proxy">Use DLNA proxy</label>
            </div>
            <Modal.Footer>
                <Modal.Button tabIndex={6} dismiss>Cancel</Modal.Button>
                <Modal.Button tabIndex={5} className="text-primary" icon="sprites.svg#plus" type="submit" name="action" value="add">Add</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}
