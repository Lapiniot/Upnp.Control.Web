import { RowState } from "@components/RowStateContext";
import AlbumArt from "@routes/common/AlbumArt";
import { type CellTemplateProps } from "@routes/common/BrowserView";
import { playlistBookmarks } from "@routes/common/IndexedDBBookmarkStore";
import { createBookmarkButton } from "@routes/common/ToggleBookmarkButton";
import { TrackInfoLine } from "@routes/common/TrackInfoLine";
import { type EventHandler, type UIEvent } from "react";

type CellContext = {
    state?: Upnp.PlaybackState;
    play: EventHandler<UIEvent<HTMLElement>>;
    pause: EventHandler<UIEvent<HTMLElement>>;
    playItem: EventHandler<UIEvent<HTMLElement>>;
    device: string;
    deviceName?: string;
}

const BookmarkItemButton = createBookmarkButton("PlaylistBookmarkWidget", playlistBookmarks, ["symbols.svg#favorite_fill1", "symbols.svg#favorite"]);

export default function Router({ data: d, context: ctx, index, rowState }: CellTemplateProps<CellContext>) {
    const active = !!(rowState & RowState.Active);
    const playing = ctx?.state === "PLAYING";
    return <div className="hstack g-3">
        <button type="button" className="btn btn-stack rounded-circle" data-index={index}
            onClick={active ? (playing ? ctx?.pause : ctx?.play) : ctx?.playItem}>
            <AlbumArt itemClass={d.class} albumArts={d.albumArts} hint="player" />
            {active && <svg className={"album-art hover-hide fade-in-out text-bg-primary bg-opacity-50" + (playing ? " animate-pulse" : "")}>
                <use href={`symbols.svg#${playing ? "volume_up" : "volume_mute"}`} />
            </svg>}
            <svg className="album-art hover-show fade-in-out text-bg-primary bg-opacity-50">
                <use href={`symbols.svg#${active && playing ? "pause_circle" : "play_circle"}`} />
            </svg>
        </button>
        <span className="vstack overflow-hidden justify-content-center">
            <span className="text-truncate">{d.title}</span>
            <TrackInfoLine item={d} />
        </span>
        {d.container && ctx?.deviceName && <BookmarkItemButton item={d} device={ctx?.device as string} deviceName={ctx?.deviceName as string} />}
        <button type="button" className="btn btn-icon" data-id={d.id} data-index={index} data-toggle="dropdown" disabled={!!(rowState & RowState.Readonly)}>
            <svg><use href="symbols.svg#more_vert" /></svg>
        </button>
    </div>;
}