import React, { EventHandler, UIEvent } from "react";
import AlbumArt from "../../common/AlbumArt";
import { DIDLItem, PlaybackState } from "../../common/Types";

export type CellContext = {
    active: (item: DIDLItem, index: number) => boolean;
    parents: DIDLItem[];
    state: PlaybackState | undefined;
    play: EventHandler<UIEvent<HTMLDivElement>>;
    pause: EventHandler<UIEvent<HTMLDivElement>>;
    playUrl: EventHandler<UIEvent<HTMLDivElement>>;
}

type CellTemplateProps = {
    data: DIDLItem;
    context: CellContext;
    index: number;
}

export default function ({ data: d, context: { active, parents, state, play, pause, playUrl }, index }: CellTemplateProps) {
    const isActive = active(d, index);
    const url = parents[0]?.res?.url ? `${parents[0].res.url}#tracknr=${index + 1},play` : `${d?.res?.url}#play`;
    return <div className="d-flex align-items-center">
        <div className="d-inline-block stack mr-1">
            <AlbumArt itemClass={d.class} albumArts={d.albumArts} />
            {isActive
                ? state === "PLAYING"
                    ? <React.Fragment key="active-playing">
                        <div className="stack-layer d-flex">
                            <i className="m-auto fas fa-lg fa-volume-up animate-pulse" />
                        </div>
                        <div className="stack-layer stack-layer-hover d-flex" onClick={pause}>
                            <i className="m-auto fas fa-lg fa-pause-circle" />
                        </div>
                    </React.Fragment>
                    : <React.Fragment key="active-paused">
                        <div className="stack-layer d-flex">
                            <i className="m-auto fas fa-lg fa-volume-off text-muted" />
                        </div>
                        <div className="stack-layer stack-layer-hover d-flex" onClick={play}>
                            <i className="m-auto fas fa-lg fa-play-circle" />
                        </div>
                    </React.Fragment>
                : <div className="stack-layer stack-layer-hover d-flex" onClick={playUrl} data-play-url={url}>
                    <i className="m-auto fas fa-lg fa-play-circle" />
                </div>}
        </div>
        <span className="text-truncate">
            {d.title}
            {d.creator && <>&nbsp;&bull;&nbsp;<small>{d.creator}</small></>}
            {d.album && <>&nbsp;&bull;&nbsp;<small>{d.album}</small></>}
        </span>
    </div>;
}
