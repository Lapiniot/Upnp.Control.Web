import React from "react";
import AlbumArt from "../../common/AlbumArt";

export default function ({ data, context: { active, parents, state, play, pause, playUrl }, index }) {
    const isActive = active(data, index);
    const url = parents[0]?.res?.url ? `${parents[0].res.url}#tracknr=${index + 1},play` : `${data.res.url}#play`;
    return <div className="d-flex align-items-center">
        <div className="d-inline-block stack mr-1">
            <AlbumArt itemClass={data.class} albumArts={data.albumArts} />
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
        <div>
            {data.title}
            {data.creator && <small>&nbsp;&bull;&nbsp;{data.creator}</small>}
            {data.album && <small>&nbsp;&bull;&nbsp;{data.album}</small>}
        </div>
    </div>;
}
