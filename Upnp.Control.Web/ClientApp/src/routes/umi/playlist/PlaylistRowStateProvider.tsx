import { PropsWithChildren, useMemo } from "react";
import { RowStateProvider } from "../../common/RowStateContext";
import { DIDLItem, RowState } from "../../common/Types";
import { usePlaybackState } from "./PlaybackStateContext";

type TrackIndexCallback = (playlist: string | undefined, track: string | undefined) => number;

function isReadonly(item: DIDLItem) {
    if (item.readonly) return true;
    const type = item?.vendor?.["mi:playlistType"];
    return type === "aux" || type === "usb";
}

function isNavigable(item: DIDLItem) {
    return item?.vendor?.["mi:playlistType"] !== "aux";
}

type PlaylistRowStateProviderProps = {
    items: DIDLItem[] | undefined;
    getActiveTrackIndexHook: TrackIndexCallback | undefined;
};

export function PlaylistRowStateProvider({ getActiveTrackIndexHook, ...other }: PropsWithChildren<PlaylistRowStateProviderProps>) {
    const { playlist, track } = usePlaybackState();

    const current = getActiveTrackIndexHook?.(playlist, track);

    const mapper = useMemo(() => function (item: DIDLItem, index: number, state = RowState.None) {
        return (isNavigable(item) ? RowState.Navigable : RowState.None)
            | (isReadonly(item) ? RowState.Readonly : (RowState.Selectable | state & RowState.Selected))
            | (index === current ? RowState.Active : RowState.None);
    }, [current]);

    return <RowStateProvider {...other} mapper={mapper} />;
}