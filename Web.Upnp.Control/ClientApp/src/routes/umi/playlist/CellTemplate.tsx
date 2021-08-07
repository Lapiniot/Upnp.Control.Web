import React, { EventHandler, UIEvent } from "react";
import { playlistBookmarks } from "../../../components/BookmarkService";
import AlbumArt from "../../common/AlbumArt";
import { useBookmarkButton } from "../../common/BookmarkButton";
import { CellTemplateProps } from "../../common/BrowserView";
import { PlaybackState, RowState } from "../../common/Types";

type CellContext = {
    state?: PlaybackState;
    play?: EventHandler<UIEvent<HTMLElement>>;
    pause?: EventHandler<UIEvent<HTMLElement>>;
    playUrl?: EventHandler<UIEvent<HTMLElement>>;
    device: string;
    deviceName?: string;
}

const BookmarkItemButton = useBookmarkButton("PlaylistBookmarkWidget", playlistBookmarks, ["#heart-solid", "#heart"]);

export default function ({ data: d, context: ctx, index, rowState }: CellTemplateProps<CellContext>) {
    const artist = d.artists?.[0] ?? d.creator;
    return <div className="hstack">
        <div className="playback-aa-ctrl stack me-2">
            <AlbumArt itemClass={d.class} albumArts={d.albumArts} />
            {rowState & RowState.Active
                ? ctx?.state === "PLAYING"
                    ? <React.Fragment key="active-playing">
                        <div className="stack-layer">
                            <svg className="icon m-auto icon-lg animate-pulse"><use href="#volume-up" /></svg>
                        </div>
                        <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.pause}>
                            <svg className="icon m-auto icon-lg"><use href="#pause-circle" /></svg>
                        </button>
                    </React.Fragment>
                    : <React.Fragment key="active-paused">
                        <div className="stack-layer">
                            <svg className="icon m-auto icon-lg"><use href="#volume-off" /></svg>
                        </div>
                        <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.play}>
                            <svg className="icon m-auto icon-lg"><use href="#play-circle" /></svg>
                        </button>
                    </React.Fragment>
                : <button type="button" className="btn btn-overlay stack-layer stack-layer-hover" onClick={ctx?.playUrl} data-index={index}>
                    <svg className="icon m-auto icon-lg"><use href="#play-circle" /></svg>
                </button>}
        </div>
        <span className="vstack overflow-hidden">
            <span className="text-truncate">{d.title}</span>
            {(d.album || artist) && <small className="text-truncate">{artist}{artist && <>&nbsp;&bull;&nbsp;</>}{d.album}</small>}
        </span>
        {d.container && ctx?.deviceName && <BookmarkItemButton item={d} device={ctx?.device as string} deviceName={ctx?.deviceName as string} />}
        <button type="button" className="btn btn-round btn-plain" data-id={d.id} data-index={index} data-bs-toggle="dropdown" disabled={!!(rowState & RowState.Readonly)}>
            <svg><use href="#ellipsis-v" /></svg>
        </button>
    </div>;
}