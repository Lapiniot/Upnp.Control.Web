import { EventHandler, UIEvent } from "react";
import { playlistBookmarks } from "../../../components/BookmarkService";
import AlbumArt from "../../common/AlbumArt";
import { useBookmarkButton } from "../../common/BookmarkButton";
import { CellTemplateProps } from "../../common/BrowserView";
import { RowState } from "../../common/RowStateContext";
import { TrackInfoLine } from "../../common/TrackInfoLine";
import { PlaybackState } from "../../common/Types";

type CellContext = {
    state?: PlaybackState;
    play?: EventHandler<UIEvent<HTMLElement>>;
    pause?: EventHandler<UIEvent<HTMLElement>>;
    playItem?: EventHandler<UIEvent<HTMLElement>>;
    device: string;
    deviceName?: string;
}

const BookmarkItemButton = useBookmarkButton("PlaylistBookmarkWidget", playlistBookmarks, ["symbols.svg#favorite", "symbols.svg#favorite_border"]);

export default function ({ data: d, context: ctx, index, rowState }: CellTemplateProps<CellContext>) {
    const active = !!(rowState & RowState.Active);
    const playing = ctx?.state === "PLAYING";
    return <div className="hstack">
        <button type="button" className="btn btn-stack me-2 flex-shrink-0" data-index={index}
            onClick={active ? (playing ? ctx.pause : ctx?.play) : ctx?.playItem}>
            <AlbumArt itemClass={d.class} albumArts={d.albumArts} hint="player" />
            {active && <div className="d-flex album-art hover-hide fade-in-out text-white bg-black bg-opacity-50">
                <svg className={playing ? "animate-pulse" : ""}>
                    <use href={`symbols.svg#${playing ? "volume_up" : "volume_mute"}`} />
                </svg>
            </div>}
            <svg className="album-art hover-show fade-in-out text-white bg-black bg-opacity-25">
                <use href={`symbols.svg#${active && playing ? "pause_circle" : "play_circle"}`} />
            </svg>
        </button>
        <span className="vstack overflow-hidden justify-content-center">
            <span className="text-truncate">{d.title}</span>
            <TrackInfoLine item={d} />
        </span>
        {d.container && ctx?.deviceName && <BookmarkItemButton item={d} device={ctx?.device as string} deviceName={ctx?.deviceName as string} />}
        <button type="button" className="btn btn-round btn-plain" data-id={d.id} data-index={index} data-bs-toggle="dropdown" disabled={!!(rowState & RowState.Readonly)}>
            <svg><use href="symbols.svg#more_vert" /></svg>
        </button>
    </div>;
}