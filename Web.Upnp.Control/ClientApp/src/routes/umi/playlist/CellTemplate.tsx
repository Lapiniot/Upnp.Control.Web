import React, { EventHandler, UIEvent } from "react";
import { playlistBookmarks } from "../../../components/BookmarkService";
import AlbumArt from "../../common/AlbumArt";
import { useBookmarkButton } from "../../common/BookmarkButton";
import { CellTemplateProps, RowState } from "../../common/BrowserView";
import { PlaybackState } from "../../common/Types";

type CellContext = {
    state?: PlaybackState;
    play?: EventHandler<UIEvent<HTMLDivElement>>;
    pause?: EventHandler<UIEvent<HTMLDivElement>>;
    playUrl?: EventHandler<UIEvent<HTMLDivElement>>;
    device: string;
    deviceName?: string;
}

const BookmarkItemButton = useBookmarkButton("PlaylistBookmarkWidget", playlistBookmarks, ["#heart-solid", "#heart"]);

export default function ({ data: d, context: ctx, index, rowState }: CellTemplateProps<CellContext>) {
    return <div className="d-flex align-items-center">
        <div className="d-inline-block stack me-1">
            <AlbumArt itemClass={d.class} albumArts={d.albumArts} />
            {rowState & RowState.Active
                ? ctx?.state === "PLAYING"
                    ? <React.Fragment key="active-playing">
                        <div className="stack-layer d-flex">
                            <svg className="icon m-auto icon-lg animate-pulse"><use href="#volume-up" /></svg>
                        </div>
                        <div className="stack-layer d-flex stack-layer-hover" onClick={ctx?.pause}>
                            <svg className="icon m-auto icon-lg"><use href="#pause-circle" /></svg>
                        </div>
                    </React.Fragment>
                    : <React.Fragment key="active-paused">
                        <div className="stack-layer d-flex">
                            <svg className="icon m-auto icon-lg"><use href="#volume-off" /></svg>
                        </div>
                        <div className="stack-layer d-flex stack-layer-hover" onClick={ctx?.play}>
                            <svg className="icon m-auto icon-lg"><use href="#play-circle" /></svg>
                        </div>
                    </React.Fragment>
                : <div className="stack-layer d-flex stack-layer-hover" onClick={ctx?.playUrl} data-id={d.id}>
                    <svg className="icon m-auto icon-lg"><use href="#play-circle" /></svg>
                </div>}
        </div>
        <span className="text-truncate flex-grow-1">
            {d.title}
            {d.creator && <>&nbsp;&bull;&nbsp;<small>{d.creator}</small></>}
            {d.album && <>&nbsp;&bull;&nbsp;<small>{d.album}</small></>}
        </span>
        {d.container && ctx?.deviceName && <BookmarkItemButton item={d} device={ctx?.device as string} deviceName={ctx?.deviceName as string} />}
        <button type="button" className="btn btn-round btn-icon btn-primary" data-id={d.id} data-index={index} data-bs-toggle="dropdown" disabled={!!(rowState & RowState.Readonly)}>
            <svg><use href="#ellipsis-v" /></svg>
        </button>
    </div>;
}