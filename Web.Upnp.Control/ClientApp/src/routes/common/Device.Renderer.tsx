import React, { ReactNode } from "react";
import WebApi from "../../components/WebApi";
import { BrowserCoreProps } from "./BrowserCore";
import BrowserDialog, { BrowseResult } from "./BrowserDialog";
import { DIDLUtils } from "./BrowserUtils";
import DeviceIcon from "./DeviceIcon";
import PlayerWidget from "./PlayerWidget";
import { DataSourceProps, UpnpDevice } from "./Types";

type RenderDeviceProps = DataSourceProps<UpnpDevice> & {
    category?: string;
}

type RenderDeviceState = { modal?: ReactNode | null }

const browserProps: BrowserCoreProps = {
    filter: DIDLUtils.isMediaItem,
    selectOnClick: true
}

export default class RenderDevice extends React.Component<RenderDeviceProps, RenderDeviceState> {

    state = { modal: null }

    resetModal = () => {
        this.setState({ modal: null });
    }

    playMedia = (data: BrowseResult) => {
        const deviceId = this.props["data-source"]?.udn;
        const { keys: { 0: objectId }, device: source } = data;

        if (!deviceId || !source || !objectId) return;

        return WebApi.control(deviceId).play(objectId, source).fetch();
    }

    browse = () => {
        this.setState({
            modal: <BrowserDialog id="open-media-dialog" title="Select media to play" confirmText="Open" className="modal-lg modal-vh-80"
                onDismiss={this.resetModal} onConfirm={this.playMedia} browserProps={browserProps} immediate>
            </BrowserDialog>
        })
    }

    render() {

        const { "data-source": { name, description, udn, type, icons } } = this.props;

        return <div className="card shadow">
            <div className="card-header d-flex flex-row">
                <DeviceIcon service={type} icons={icons} />
                <div>
                    <h5 className="card-title">{name}</h5>
                    <h6 className="card-subtitle">{description}</h6>
                </div>
            </div>
            <div className="card-body">
                <PlayerWidget udn={udn} />
            </div>
            <div className="card-footer no-decoration d-flex gap-2">
                <button type="button" className="btn nav-link btn-link p-0" onClick={this.browse}>Open media</button>
            </div>
            {this.state.modal}
        </div>
    }
}