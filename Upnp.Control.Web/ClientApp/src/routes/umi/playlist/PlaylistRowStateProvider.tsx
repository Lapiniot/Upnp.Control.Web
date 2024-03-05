import { PropsWithChildren, useContext, useMemo } from "react";
import { PlaybackStateContext } from "../../common/PlaybackStateContext";
import { RowState, RowStateProvider } from "../../../components/RowStateContext";

type TrackIndexCallback = (playlist: string | undefined | null, track: string | undefined | null) => number;

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
    const { state: { currentTrack, medium, current, vendor } } = useContext(PlaybackStateContext);
    const playlist = medium === "X-MI-AUX" || (medium === "NONE" && current?.id === "1")
        ? "aux"
        : vendor?.["playlist_transport_uri"] ?? vendor?.["mi:playlist_transport_uri"];

    const currentIndex = getActiveTrackIndexHook?.(playlist, currentTrack);

    const mapper = useMemo(() => function (item: Upnp.DIDL.Item, index: number, state = RowState.None) {
        return (isNavigable(item) ? RowState.Navigable : RowState.None)
            | (isReadonly(item) ? RowState.Readonly : (RowState.Selectable | state & RowState.Selected))
            | (index === currentIndex ? RowState.Active : RowState.None);
    }, [currentIndex]);

    return <RowStateProvider {...other} mapper={mapper} />
}