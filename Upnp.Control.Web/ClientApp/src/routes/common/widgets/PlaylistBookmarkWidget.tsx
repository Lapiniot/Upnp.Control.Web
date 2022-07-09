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

// TODO: fix layout issue with link not occupying available container space
// TODO: consider merge of album-art and generic icon styles

export default function ({ device, id, title, icon, deviceName }: PlaylistBookmarkWidgetProps) {
    const clickHandler = useCallback(() => WebApi.control(device).playUri(`x-mi://sys/playlist?id=${id.substring(3)}#play`).fetch(), []);
    return <div className="hstack overflow-hidden align-items-center">
        <button type="button" className={`btn btn-stack mx-2`}
            title={`Play \u00AB${title}\u00BB on ${deviceName}`} onClick={clickHandler}>
            <AlbumArt albumArts={icon ? [icon] : undefined} itemClass="object.container.playlistContainer" hint="player" />
            <svg className="album-art hover-show fade-in-out text-white bg-black bg-opacity-25"><use href="symbols.svg#play_circle" /></svg>
        </button>
        <RouteLink to={`/umi/${device}/playlists/${id}`} title={`${title} on ${deviceName}`}
            className="overflow-hidden text-decoration-none ps-0 p-2">
            <h6 className="mb-0 text-truncate">{title}</h6>
            <p className="mb-0 small text-truncate">[{deviceName}]</p>
        </RouteLink>
    </div>
}