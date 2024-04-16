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
    const clickHandler = useCallback(() => WebApi.control(device).playUri(`x-mi://sys/playlist?id=${id.substring(3)}#play`).fetch(), [device, id]);
    return <div className="card-horizontal">
        <button type="button" className="btn btn-stack"
            title={`Play \u00AB${title}\u00BB on ${deviceName}`} onClick={clickHandler}>
            <AlbumArt className="icon-56" albumArts={icon ? [icon] : undefined} itemClass="object.container.playlistContainer" hint="player" />
            <svg className="album-art icon-56 hover-show fade-in-out text-bg-primary bg-opacity-50"><use href="symbols.svg#play_circle" /></svg>
        </button>
        <RouteLink className="text-decoration-none" to={`/umi/${device}/playlists/${id}`} title={`${title} on \xab${deviceName}\xbb`}>
            <h6 className="mb-0 text-truncate">{title}</h6>
            <p className="mb-0 small text-truncate">{deviceName}</p>
        </RouteLink>
    </div>
}