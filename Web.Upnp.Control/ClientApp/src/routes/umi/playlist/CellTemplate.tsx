import React, { EventHandler, UIEvent } from "react";
import AlbumArt from "../../common/AlbumArt";
import { RowState } from "../../common/BrowserCore";
import { DIDLItem, PlaybackState } from "../../common/Types";

export type CellContext = {
    state?: PlaybackState;
    play?: EventHandler<UIEvent<HTMLDivElement>>;
    pause?: EventHandler<UIEvent<HTMLDivElement>>;
    playUrl?: EventHandler<UIEvent<HTMLDivElement>>;
}

type CellTemplateProps = {
    data: DIDLItem;
    index: number;
    rowState: RowState;
    context?: CellContext;
}

export default function ({ data: d, context: { state, play, pause, playUrl } = {}, index, rowState }: CellTemplateProps) {
    return <div className="d-flex align-items-center">
        <div className="d-inline-block stack me-1">
            <AlbumArt itemClass={d.class} albumArts={d.albumArts} />
            {rowState & RowState.Active
                ? state === "PLAYING"
                    ? <React.Fragment key="active-playing">
                        <div className="stack-layer d-flex">
                            <svg className="icon m-auto icon-lg animate-pulse"><use href="#volume-up" /></svg>
                        </div>
                        <div className="stack-layer d-flex stack-layer-hover" onClick={pause}>
                            <svg className="icon m-auto icon-lg"><use href="#pause-circle" /></svg>
                        </div>
                    </React.Fragment>
                    : <React.Fragment key="active-paused">
                        <div className="stack-layer d-flex">
                            <svg className="icon m-auto icon-lg"><use href="#volume-off" /></svg>
                        </div>
                        <div className="stack-layer d-flex stack-layer-hover" onClick={play}>
                            <svg className="icon m-auto icon-lg"><use href="#play-circle" /></svg>
                        </div>
                    </React.Fragment>
                : <div className="stack-layer d-flex stack-layer-hover" onClick={playUrl} data-play-index={index}>
                    <svg className="icon m-auto icon-lg"><use href="#play-circle" /></svg>
                </div>}
        </div>
        <span className="text-truncate flex-basis-100">
            {d.title}
            {d.creator && <>&nbsp;&bull;&nbsp;<small>{d.creator}</small></>}
            {d.album && <>&nbsp;&bull;&nbsp;<small>{d.album}</small></>}
        </span>
        <button type="button" className="btn btn-round" data-menu-toggle-for={d.id} data-bs-toggle="dropdown" disabled={!!(rowState & RowState.Readonly)}>
            <svg><use href="#ellipsis-v" /></svg>
        </button>
    </div>;
}
