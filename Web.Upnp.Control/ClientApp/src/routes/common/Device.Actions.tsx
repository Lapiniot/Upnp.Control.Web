import React, { ReactNode } from "react";
import { NavLink, RouteLink } from "../../components/NavLink";
import WebApi from "../../components/WebApi";
import { BrowserProps, RowState } from "./BrowserView";
import BrowserDialog, { BrowseResult } from "./BrowserDialog";
import { DIDLUtils } from "./BrowserUtils";
import { Services, UpnpDevice } from "./Types";

export type DeviceActionProps = {
    device: UpnpDevice;
    category?: string;
};

const browserProps: BrowserProps<unknown> = {
    rowState: () => RowState.Navigable | RowState.Selectable
}

const audioBrowserProps: BrowserProps<unknown> = {
    rowState: (item) => DIDLUtils.isMusicTrack(item) ? RowState.Selectable | RowState.Navigable : RowState.Navigable
}

export function BrowseContentAction({ device, category }: DeviceActionProps) {
    const isMediaServer = device.services && device.services.some(
        s => s.type.startsWith(Services.ContentDirectory) || s.type.startsWith(Services.UmiPlaylist));
    return isMediaServer ? <RouteLink to={`/${category}/${device.udn}/browse`} glyph="folder" className="p-0 nav-link">Browse</RouteLink> : null;
}

export function DownloadMetadataAction({ device }: DeviceActionProps) {
    return <NavLink to={device.url} glyph="download" className="p-0">Metadata</NavLink>;
}

class OpenAction extends React.Component<DeviceActionProps & { browserProps: BrowserProps<unknown> }, { modal?: ReactNode | null }>{
    state = { modal: null }

    resetModal = () => this.setState({ modal: null });

    playMedia = (data: BrowseResult) => {
        const deviceId = this.props.device.udn;
        const { keys: { 0: objectId }, device: source } = data;
        if (!deviceId || !source || !objectId) return;
        return WebApi.control(deviceId).play(objectId, source).fetch();
    }

    browse = () => {
        this.setState({
            modal: <BrowserDialog id="open-media-dialog" title="Select media to play" confirmText="Open" className="modal-lg"
                onDismissed={this.resetModal} onConfirmed={this.playMedia} browserProps={this.props.browserProps} immediate>
            </BrowserDialog>
        })
    }

    render() {
        return <>
            <button type="button" className="btn nav-link btn-link p-0" onClick={this.browse}>
                {this.props.children}
            </button>
            {this.state.modal}
        </>;
    }
}

export function OpenMediaAction(props: DeviceActionProps) {
    return <OpenAction {...props} browserProps={browserProps}>
        <svg className="icon"><use href="#photo-video" /></svg>Open media
    </OpenAction>
}

export function OpenAudioAction(props: DeviceActionProps) {
    return <OpenAction {...props} browserProps={audioBrowserProps}>
        <svg className="icon"><use href="#music" /></svg>Open audio
    </OpenAction>
}