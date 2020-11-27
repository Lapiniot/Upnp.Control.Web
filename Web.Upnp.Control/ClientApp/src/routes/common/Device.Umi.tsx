import React, { HTMLAttributes } from "react";
import "bootstrap/js/dist/dropdown";
import { RouteLink } from "../../components/NavLink";
import PlayerWidget from "./PlayerWidget";
import { BrowseFetchResult, DataSourceProps, UpnpDevice } from "./Types";
import { fromBaseQuery } from "./BrowserUtils";
import $api from "../../components/WebApi";
import { DataFetchProps, withDataFetch } from "../../components/DataFetch";
import AlbumArt from "./AlbumArt";

function MicroLoader() {
    return <span><i className="fas fa-spinner fa-spin" /></span>
}

function playUrlHandler(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    const url = e.currentTarget.dataset["playUrl"];
    const device = e.currentTarget.parentElement?.parentElement?.dataset["device"];
    if (device && url) $api.control(device).playUri(url).fetch();
    e.preventDefault();
    return false;
}

function Menu({ dataContext: d, device }: HTMLAttributes<HTMLDivElement> & DataFetchProps<BrowseFetchResult> & { device?: string }) {
    return <div className="btn-group dropright">
        <a href="#" className="nav-link p-0 px-1" data-toggle="dropdown" aria-expanded="false" title="Quick switch playlists">
            <i className="fas fa-caret-right fa-lg" /><span className="visually-hidden">Toggle Dropdown</span>
        </a>
        <ul className="dropdown-menu" data-device={device}>
            {d?.source.items.map(i => <li>
                <a className="dropdown-item" href="#" data-play-url={i.res?.url + "#play"} onClick={playUrlHandler}>
                    <AlbumArt itemClass={i.class} albumArts={i.albumArts} className="album-art-sm mr-1 align-middle" />{i.title}</a>
            </li>)}
        </ul>
    </div>
}

const builder = fromBaseQuery((device) => $api.browse(device).get("PL:").withResource().withVendor());

const PlaylistMenu = withDataFetch(Menu, builder, { template: MicroLoader });

export default function UmiDevice({ "data-source": { name, description, udn } }: DataSourceProps<UpnpDevice>) {
    return <div className="card">
        <div className="card-header d-flex flex-row">
            <svg className="upnp-dev-icon" style={{ objectFit: "unset" }}>
                <use href="icons.svg#s-music-player" />
            </svg>
            <div>
                <h5 className="card-title">{name}</h5>
                <h6 className="card-subtitle">{description}</h6>
            </div>
        </div>
        <div className="card-body">
            <PlayerWidget udn={udn} />
        </div>
        <div className="card-footer d-flex align-items-center gap-2 no-decoration">
            <RouteLink to={`/umi/${udn}/browse`} glyph="folder" className="p-0 btn-link" title="Browse content">Browse</RouteLink>
            <RouteLink to={`/umi/${udn}/playlists/PL:`} glyph="list-alt" className="p-0" title="Manage playlists">Playlists</RouteLink>
            <PlaylistMenu device={udn} />
        </div>
    </div>;
}
