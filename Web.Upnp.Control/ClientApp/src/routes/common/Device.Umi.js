import React from "react";
import { RouteLink } from "../../components/NavLink";
import DeviceIcon from "./DeviceIcon";
import PlayerWidget from "./PlayerWidget";

export default function UmiDevice({ "data-source": { icons, name, type, description, udn } }) {
    return <div className="card">
        <div className="card-header d-flex flex-row">
            <DeviceIcon service={type} icons={icons} />
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
