import React, { FormEventHandler } from "react";
import Modal, { ModalProps } from "../../../../components/Modal";

export class AddUrlModalDialog extends React.Component<ModalProps & { onAdd: (url: string, title: string, useProxy: boolean) => void }> {

    urlRef = React.createRef<HTMLInputElement>();
    titleRef = React.createRef<HTMLInputElement>();
    proxyRef = React.createRef<HTMLInputElement>();
    formRef = React.createRef<HTMLFormElement>();
    modalRef = React.createRef<Modal>();

    style = { width: "86px" };

    onAdd = () => this.props.onAdd(
        this.urlRef.current?.value as string,
        this.titleRef.current?.value as string,
        this.proxyRef.current?.checked as boolean);

    onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        const form = e.currentTarget;

        e.preventDefault();
        e.stopPropagation();

        if (form.checkValidity()) {
            this.onAdd();
            this.modalRef.current?.dismiss();
        }

        form.classList.add("was-validated");

        return false;
    }

    submit = () => {
        this.formRef.current?.dispatchEvent(new Event("submit"));
    }

    render() {
        const { onAdd, ...other } = this.props;
        return <Modal title="Provide external media url" immediate {...other} ref={this.modalRef}>
            <form ref={this.formRef} onSubmitCapture={this.onSubmit} noValidate>
                <div className="input-group has-validation mb-3">
                    <span className="input-group-text text-end d-inline" id="basic-addon1" style={this.style}>Feed url</span>
                    <input ref={this.urlRef} type="url" className="form-control" placeholder="[provide value]" pattern="http(s?)://.*" required
                        aria-label="Url" aria-describedby="basic-addon1" />
                    <div className="invalid-tooltip">Please provide a valid feed url</div>
                </div>
                <div className="input-group mb-3">
                    <span className="input-group-text text-end d-inline" id="basic-addon2" style={this.style}>Title</span>
                    <input ref={this.titleRef} type="text" className="form-control" placeholder="[provide value]" aria-label="Title" aria-describedby="basic-addon2" />
                </div>
                <div className="form-check form-switch">
                    <input ref={this.proxyRef} className="form-check-input" type="checkbox" id="use-dlna-proxy" defaultChecked />
                    <label className="form-check-label" htmlFor="use-dlna-proxy">Use DLNA proxy for live stream</label>
                </div>
            </form>
            <Modal.Footer>
                <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
                <Modal.Button className="btn-primary" icon="plus" onClick={this.submit}>Add</Modal.Button>
            </Modal.Footer>
        </Modal>;
    }
}
