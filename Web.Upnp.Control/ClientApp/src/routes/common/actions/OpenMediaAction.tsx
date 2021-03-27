import { useCallback, useRef } from "react";
import WebApi from "../../../components/WebApi";
import { BrowserProps } from "../BrowserView";
import BrowserDialog, { BrowseResult } from "../BrowserDialog";
import { DeviceActionProps } from "./Actions";
import { DIDLUtils } from "../BrowserUtils";
import ModalHost from "../../../components/ModalHost";
import { RowState } from "../Types";

const browserProps: BrowserProps<unknown> = {
    rowStateProvider: () => RowState.Navigable | RowState.Selectable
}

const audioBrowserProps: BrowserProps<unknown> = {
    rowStateProvider: (item) => DIDLUtils.isMusicTrack(item) ? RowState.Selectable | RowState.Navigable : RowState.Navigable
}

export function OpenAction({ children, className, browserProps, device, category, ...other }: DeviceActionProps & { browserProps: BrowserProps<unknown> }) {
    const modalHostRef = useRef<ModalHost>(null);
    const playHandler = useCallback((data: BrowseResult) => {
        const deviceId = device.udn;
        const { keys: { 0: objectId }, device: source } = data;
        if (!deviceId || !source || !objectId) return;
        return WebApi.control(deviceId).play(objectId, source).fetch();
    }, [device]);
    const browseClickHandler = useCallback(() =>
        modalHostRef.current?.show(
            <BrowserDialog className="modal-lg modal-fullscreen-sm-down" title="Select media to play"
                onConfirmed={playHandler} browserProps={browserProps}>
            </BrowserDialog>)
        , [device]);
    return <>
        <button type="button" className={`btn btn-round btn-plain${className ? ` ${className}` : ""}`} data-bs-toggle="dropdown"
            aria-expanded="false" title="Browse for external media to play on this device" {...other} onClick={browseClickHandler}>
            {children}
        </button>
        <ModalHost ref={modalHostRef} />
    </>;
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