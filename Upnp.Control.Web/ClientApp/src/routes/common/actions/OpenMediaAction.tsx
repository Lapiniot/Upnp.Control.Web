import { useCallback, useRef } from "react";
import DialogHost from "../../../components/DialogHost";
import WebApi from "../../../services/WebApi";
import BrowserDialog, { BrowseResult } from "../BrowserDialog";
import { isMusicTrack } from "../DIDLTools";
import { BrowserProps } from "../BrowserView";
import { RowState, RowStateMapperFunction } from "../../../components/RowStateContext";
import { DeviceActionProps } from "./Actions";

type OpenActionProps = DeviceActionProps & {
    browserProps?: BrowserProps<unknown>,
    rowStateMapper?: RowStateMapperFunction
}

export function OpenAction({ children, className, browserProps, device, category, rowStateMapper, ...other }: OpenActionProps) {
    const dialogHostRef = useRef<DialogHost>(null);
    const deviceId = device?.udn;
    const playHandler = useCallback((data: BrowseResult) => {
        const { keys: { 0: objectId }, device: source } = data;
        if (!deviceId || !source || !objectId) return;
        return WebApi.control(deviceId).play(objectId, source).fetch();
    }, [deviceId]);
    const browseClickHandler = useCallback(() =>
        dialogHostRef.current?.show(
            <BrowserDialog title="Select media to play"
                onConfirmed={playHandler} browserProps={browserProps} rowStateMapper={rowStateMapper}>
            </BrowserDialog>)
        , [browserProps, playHandler, rowStateMapper]);
    return <>
        <button type="button" disabled={!device} className={`btn btn-round btn-plain${className ? ` ${className}` : ""}`} data-toggle="dropdown"
            aria-expanded="false" title="Browse for external media to play on this device" {...other} onClick={browseClickHandler}>
            {children}
        </button>
        <DialogHost ref={dialogHostRef} />
    </>;
}

export function OpenMediaAction(props: DeviceActionProps) {
    return <OpenAction {...props}>
        <svg><use href="symbols.svg#video_library" /></svg>
    </OpenAction>
}

function pickAudioMapper(item: Upnp.DIDL.Item) {
    return isMusicTrack(item) ? RowState.Selectable | RowState.Navigable : RowState.Navigable
}

export function OpenAudioAction(props: DeviceActionProps) {
    return <OpenAction {...props} rowStateMapper={pickAudioMapper}>
        <svg><use href="symbols.svg#queue_music" /></svg>
    </OpenAction>
}