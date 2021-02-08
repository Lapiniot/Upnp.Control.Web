import React, { ReactNode } from "react";
import WebApi from "../../../components/WebApi";
import { BrowserProps, RowState } from "../BrowserView";
import BrowserDialog, { BrowseResult } from "../BrowserDialog";
import { DeviceActionProps } from "./Actions";
import { DIDLUtils } from "../BrowserUtils";

const browserProps: BrowserProps<unknown> = {
    rowState: () => RowState.Navigable | RowState.Selectable
}

const audioBrowserProps: BrowserProps<unknown> = {
    rowState: (item) => DIDLUtils.isMusicTrack(item) ? RowState.Selectable | RowState.Navigable : RowState.Navigable
}

export class OpenAction extends React.Component<DeviceActionProps & { browserProps: BrowserProps<unknown>; }, { modal?: ReactNode | null; }> {
    state = { modal: null };

    resetModal = () => this.setState({ modal: null });

    playMedia = (data: BrowseResult) => {
        const deviceId = this.props.device.udn;
        const { keys: { 0: objectId }, device: source } = data;
        if (!deviceId || !source || !objectId)
            return;
        return WebApi.control(deviceId).play(objectId, source).fetch();
    };

    browse = () => {
        this.setState({
            modal: <BrowserDialog id="open-media-dialog" title="Select media to play" confirmText="Open" className="modal-lg"
                onDismissed={this.resetModal} onConfirmed={this.playMedia} browserProps={this.props.browserProps} immediate>
            </BrowserDialog>
        });
    };

    render() {
        const { children, className, browserProps, device, category, ...other } = this.props;
        return <>
            <button type="button" className={`btn btn-round btn-plain${className ? ` ${className}` : ""}`} data-bs-toggle="dropdown"
                aria-expanded="false" title="Browse for external media to play on this device" {...other} onClick={this.browse}>
                {children}
            </button>
            {this.state.modal}
        </>;
    }
}

export function OpenMediaAction(props: DeviceActionProps) {
    return <OpenAction {...props} browserProps={browserProps}>
        <svg className="icon"><use href="#photo-video" /></svg>
    </OpenAction>
}

export function OpenAudioAction(props: DeviceActionProps) {
    return <OpenAction {...props} browserProps={audioBrowserProps}>
        <svg className="icon"><use href="#folder-open" /></svg>
    </OpenAction>
}