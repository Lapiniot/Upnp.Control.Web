import { PropsWithChildren, useMemo } from "react";
import { RowState, RowStateProvider } from "../../common/RowStateContext";
import { usePlaybackState } from "../../common/PlaybackStateContext";

type TrackIndexCallback = (playlist: string | undefined, track: string | undefined) => number;

function isReadonly(item: Upnp.DIDL.Item) {
    if (item.readonly) return true;
    const type = item?.vendor?.["mi:playlistType"];
    return type === "aux" || type === "usb";
}

function isNavigable(item: Upnp.DIDL.Item) {
    return item?.vendor?.["mi:playlistType"] !== "aux";
}

type PlaylistRowStateProviderProps = {
    items: Upnp.DIDL.Item[] | undefined;
    getActiveTrackIndexHook: TrackIndexCallback | undefined;
};

export function PlaylistRowStateProvider({ getActiveTrackIndexHook, ...other }: PropsWithChildren<PlaylistRowStateProviderProps>) {
    const { state: { playlist, currentTrack } } = usePlaybackState();

    const current = getActiveTrackIndexHook?.(playlist, currentTrack ?? undefined);

    const mapper = useMemo(() => function (item: Upnp.DIDL.Item, index: number, state = RowState.None) {
        return (isNavigable(item) ? RowState.Navigable : RowState.None)
            | (isReadonly(item) ? RowState.Readonly : (RowState.Selectable | state & RowState.Selected))
            | (index === current ? RowState.Active : RowState.None);
    }, [current]);

    return <RowStateProvider {...other} mapper={mapper} />
}