import { HTMLAttributes, useCallback } from "react";
import { MediaQueries } from "../../../components/MediaQueries";
import { RouteLink } from "../../../components/NavLink";
import WebApi from "../../../components/WebApi";
import AlbumArt from "../AlbumArt";

export type PlaylistBookmarkWidgetProps = HTMLAttributes<HTMLDivElement> & {
    device: string;
    deviceName: string;
    id: string;
    title: string;
    icon: string;
};

export default function ({ device, id, title, icon, deviceName }: PlaylistBookmarkWidgetProps) {
    const clickHandler = useCallback(() => WebApi.control(device).playUri(`x-mi://sys/playlist?id=${id.substring(3)}#play`).fetch(), []);
    const isTouch = MediaQueries.touchDevice.matches;
    return <div className="hstack overflow-hidden">
        <div className="playback-aa-ctrl stack ms-2 me-2 flex-shrink-0">
            <AlbumArt albumArts={icon ? [icon] : undefined} itemClass="object.container.playlistContainer" />
            <button type="button" className={`btn btn-overlay stack-layer${!isTouch ? " stack-layer-hover" : ""}`}
                title={`Play \u00AB${title}\u00BB on ${deviceName}`} onClick={clickHandler}>
                <svg className="m-auto icon-lg"><use href="symbols.svg#play_circle" /></svg>
            </button>
        </div>
        <RouteLink to={`/umi/${device}/playlists/${id}`} title={`${title} on ${deviceName}`}
            className="overflow-hidden text-decoration-none ps-0 p-2">
            <h6 className="mb-0 text-truncate">{title}</h6>
            <p className="mb-0 small text-truncate">[{deviceName}]</p>
        </RouteLink>
    </div>
}