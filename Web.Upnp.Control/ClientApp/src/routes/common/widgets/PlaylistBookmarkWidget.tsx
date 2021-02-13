import { HTMLAttributes, useCallback } from "react";
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

    return <div className="card shadow-sm">
        <div className="card-body d-flex align-items-center p-0">
            <RouteLink to={`/umi/${device}/playlists/${id}`} className="d-flex align-items-center p-3 text-decoration-none">
                <AlbumArt albumArts={icon ? [icon] : undefined} itemClass="" className="me-3" />
                <div className="d-flex flex-wrap overflow-hidden" title={`${title} on ${deviceName}`}>
                    <h6 className="card-title text-truncate flex-basis-100">{title}</h6>
                    <p className="card-subtitle text-truncate small">[on {deviceName}]</p>
                </div>
            </RouteLink>
            <button type="button" className="btn btn-round btn-plain m-1" title={`Play \u00AB${title}\u00BB on ${deviceName}`} onClick={clickHandler}>
                <svg><use href="#play" /></svg>
            </button>
        </div>
    </div>;
}