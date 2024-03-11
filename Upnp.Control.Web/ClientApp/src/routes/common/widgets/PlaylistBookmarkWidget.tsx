import { HTMLAttributes, useCallback } from "react";
import { RouteLink } from "../../../components/NavLink";
import WebApi from "../../../services/WebApi";
import AlbumArt from "../AlbumArt";

export type PlaylistBookmarkWidgetProps = HTMLAttributes<HTMLDivElement> & {
    device: string;
    deviceName: string;
    id: string;
    title: string;
    icon: string;
};

// TODO: consider merge of album-art and generic icon styles

export default function ({ device, id, title, icon, deviceName }: PlaylistBookmarkWidgetProps) {
    const clickHandler = useCallback(() => WebApi.control(device).playUri(`x-mi://sys/playlist?id=${id.substring(3)}#play`).fetch(), []);
    return <div className="hstack flex-1 rounded-auto overflow-clip">
        <button type="button" className={`btn btn-stack m-2 me-1`}
            title={`Play \u00AB${title}\u00BB on ${deviceName}`} onClick={clickHandler}>
            <AlbumArt className="icon-3x" albumArts={icon ? [icon] : undefined} itemClass="object.container.playlistContainer" hint="player" />
            <svg className="album-art icon-3x hover-show fade-in-out text-white bg-black bg-opacity-25"><use href="symbols.svg#play_circle" /></svg>
        </button>
        <RouteLink to={`/umi/${device}/playlists/${id}`} title={`${title} on ${deviceName}`}
            className="m-1 p-1 flex-1 text-decoration-none overflow-clip rounded-auto">
            <h6 className="mb-0 text-truncate">{title}</h6>
            <p className="mb-0 small text-truncate">[{deviceName}]</p>
        </RouteLink>
    </div>
}