import { useCallback, useRef } from "react";
import ModalHost from "../../../components/ModalHost";
import WebApi from "../../../components/WebApi";
import BrowserDialog, { BrowseResult } from "../BrowserDialog";
import { DIDLTools } from "../DIDLTools";
import { BrowserProps } from "../BrowserView";
import { RowStateMapperFunction } from "../RowStateContext";
import { DIDLItem, RowState } from "../Types";
import { DeviceActionProps } from "./Actions";

type OpenActionProps = DeviceActionProps & {
    browserProps?: BrowserProps<unknown>,
    rowStateMapper?: RowStateMapperFunction
}

export function OpenAction({ children, className, browserProps, device, category, rowStateMapper, ...other }: OpenActionProps) {
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
                onConfirmed={playHandler} browserProps={browserProps} rowStateMapper={rowStateMapper}>
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
    return <OpenAction {...props}>
        <svg><use href="symbols.svg#video_library" /></svg>
    </OpenAction>
}

function pickAudioMapper(item: DIDLItem) {
    return DIDLTools.isMusicTrack(item) ? RowState.Selectable | RowState.Navigable : RowState.Navigable
}

export function OpenAudioAction(props: DeviceActionProps) {
    return <OpenAction {...props} rowStateMapper={pickAudioMapper}>
        <svg><use href="symbols.svg#queue_music" /></svg>
    </OpenAction>
}