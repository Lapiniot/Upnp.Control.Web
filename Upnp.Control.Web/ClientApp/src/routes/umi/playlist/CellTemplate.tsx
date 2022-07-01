import React, { EventHandler, UIEvent } from "react";
import { playlistBookmarks } from "../../../components/BookmarkService";
import AlbumArt from "../../common/AlbumArt";
import { useBookmarkButton } from "../../common/BookmarkButton";
import { CellTemplateProps } from "../../common/BrowserView";
import { TrackInfoLine } from "../../common/TrackInfoLine";
import { PlaybackState, RowState } from "../../common/Types";

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
    return <div className="hstack">
        <div className="playback-aa-ctrl stack me-2">
            <AlbumArt itemClass={d.class} albumArts={d.albumArts} hint="player" />
            {rowState & RowState.Active
                ? ctx?.state === "PLAYING"
                    ? <React.Fragment key="active-playing">
                        <div className="stack-layer">
                            <svg className="icon m-auto icon-lg animate-pulse"><use href="symbols.svg#volume_up" /></svg>
                        </div>
                        <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.pause}>
                            <svg className="m-auto icon-lg"><use href="symbols.svg#pause_circle" /></svg>
                        </button>
                    </React.Fragment>
                    : <React.Fragment key="active-paused">
                        <div className="stack-layer">
                            <svg className="icon m-auto icon-lg"><use href="symbols.svg#volume_mute" /></svg>
                        </div>
                        <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.play}>
                            <svg className="m-auto icon-lg"><use href="symbols.svg#play_circle" /></svg>
                        </button>
                    </React.Fragment>
                : <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.playItem} data-index={index}>
                    <svg className="m-auto icon-lg"><use href="symbols.svg#play_circle" /></svg>
                </button>}
        </div>
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