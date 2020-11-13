import React from "react";
import { RouteLink } from "../../components/NavLink";
import PlayerWidget from "./PlayerWidget";
import { DataSourceProps, UpnpDevice } from "./Types";

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
            <RouteLink to={`/umi/${udn}/browse`} glyph="folder">Browse</RouteLink>
            <RouteLink to={`/umi/${udn}/playlists/PL:`} glyph="list-alt">Playlists</RouteLink>
        </div>
    </div>;
}
