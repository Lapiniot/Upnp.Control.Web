import React from "react";
import Modal, { ModalProps } from "../../../../components/Modal";

export class AddUrlModalDialog extends React.Component<ModalProps & { onAdd: (url: string, title: string, useProxy: boolean) => void }> {

    urlRef = React.createRef<HTMLInputElement>();
    titleRef = React.createRef<HTMLInputElement>();
    proxyRef = React.createRef<HTMLInputElement>();
    style = { width: "60px" };

    onAddClick = () => this.props.onAdd(
        this.urlRef.current?.value as string,
        this.titleRef.current?.value as string,
        this.proxyRef.current?.checked as boolean);

    render() {
        const { onAdd, ...other } = this.props;
        return <Modal title="Provide external media url" immediate {...other}>
            <div className="input-group mb-3">
                <span className="input-group-text text-right d-inline" id="basic-addon1" style={this.style}>Url</span>
                <input ref={this.urlRef} type="text" className="form-control" placeholder="[provide value]" aria-label="Url" aria-describedby="basic-addon1" />
            </div>
            <div className="input-group mb-3">
                <span className="input-group-text text-right d-inline" id="basic-addon2" style={this.style}>Title</span>
                <input ref={this.titleRef} type="text" className="form-control" placeholder="[provide value]" aria-label="Title" aria-describedby="basic-addon2" />
            </div>
            <div className="form-check form-switch">
                <input ref={this.proxyRef} className="form-check-input" type="checkbox" id="use-dlna-proxy" defaultChecked />
                <label className="form-check-label" htmlFor="use-dlna-proxy">Use DLNA proxy for live stream</label>
            </div>
            <Modal.Footer>
                <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
                <Modal.Button className="btn-primary" icon="plus" onClick={this.onAddClick} dismiss>Add</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}
