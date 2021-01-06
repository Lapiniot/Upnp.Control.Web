import React, { ReactNode } from "react";
import { NavLink, RouteLink } from "../../components/NavLink";
import WebApi from "../../components/WebApi";
import { BrowserCoreProps, RowState } from "./BrowserCore";
import BrowserDialog, { BrowseResult } from "./BrowserDialog";
import { Services, UpnpDevice } from "./Types";

export type DeviceActionProps = {
    device: UpnpDevice;
    category?: string;
};

const browserProps: BrowserCoreProps = {
    selectOnClick: true,
    rowState: () => RowState.None
}

export function BrowseContentAction({ device, category }: DeviceActionProps) {
    const isMediaServer = device.services && device.services.some(
        s => s.type.startsWith(Services.ContentDirectory) || s.type.startsWith(Services.UmiPlaylist));
    return isMediaServer ? <RouteLink to={`/${category}/${device.udn}/browse`} glyph="folder" className="p-0">Browse</RouteLink> : null;
}

export function ManagePlaylistsAction({ device, category }: DeviceActionProps) {
    return <RouteLink to={`/${category}/${device.udn}/playlists/PL:`} glyph="list-alt" className="p-0" title="Manage playlists">Playlists</RouteLink>
}

export function DownloadMetadataAction({ device }: DeviceActionProps) {
    return <NavLink to={device.url} glyph="download" className="p-0">Metadata</NavLink>;
}

export class OpenMediaAction extends React.Component<DeviceActionProps, { modal?: ReactNode | null }>{
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
            modal: <BrowserDialog id="open-media-dialog" title="Select media to play" confirmText="Open" className="modal-lg modal-vh-80"
                onDismiss={this.resetModal} onConfirm={this.playMedia} browserProps={browserProps} immediate>
            </BrowserDialog>
        })
    }

    render() {
        return <>
            <button type="button" className="btn nav-link btn-link p-0" onClick={this.browse}>Open media</button>
            {this.state.modal}
        </>;
    }
}