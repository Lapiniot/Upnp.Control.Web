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

const BookmarkItemButton = useBookmarkButton("PlaylistBookmarkWidget", playlistBookmarks, ["sprites.svg#heart-solid", "sprites.svg#heart"]);

export default function ({ data: d, context: ctx, index, rowState }: CellTemplateProps<CellContext>) {
    return <div className="hstack">
        <div className="playback-aa-ctrl stack me-2">
            <AlbumArt itemClass={d.class} albumArts={d.albumArts} />
            {rowState & RowState.Active
                ? ctx?.state === "PLAYING"
                    ? <React.Fragment key="active-playing">
                        <div className="stack-layer">
                            <svg className="icon m-auto icon-lg animate-pulse"><use href="sprites.svg#volume-high" /></svg>
                        </div>
                        <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.pause}>
                            <svg className="icon m-auto icon-lg"><use href="sprites.svg#circle-pause" /></svg>
                        </button>
                    </React.Fragment>
                    : <React.Fragment key="active-paused">
                        <div className="stack-layer">
                            <svg className="icon m-auto icon-lg"><use href="sprites.svg#volume-off" /></svg>
                        </div>
                        <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.play}>
                            <svg className="icon m-auto icon-lg"><use href="sprites.svg#circle-play" /></svg>
                        </button>
                    </React.Fragment>
                : <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.playItem} data-index={index}>
                    <svg className="icon m-auto icon-lg"><use href="sprites.svg#circle-play" /></svg>
                </button>}
        </div>
        <span className="vstack overflow-hidden justify-content-center">
            <span className="text-truncate">{d.title}</span>
            <TrackInfoLine item={d} />
        </span>
        {d.container && ctx?.deviceName && <BookmarkItemButton item={d} device={ctx?.device as string} deviceName={ctx?.deviceName as string} />}
        <button type="button" className="btn btn-round btn-plain" data-id={d.id} data-index={index} data-bs-toggle="dropdown" disabled={!!(rowState & RowState.Readonly)}>
            <svg><use href="sprites.svg#ellipsis-vertical" /></svg>
        </button>
    </div>;
}