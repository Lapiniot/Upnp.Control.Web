import React from "react";
import { RouteLink } from "../../components/NavLink";
import DeviceIcon from "./DeviceIcon";
import PlayerWidget from "./PlayerWidget";
import { DataSourceProps, UpnpDevice } from "./Types";

export default function RendererDevice({ "data-source": { name, description, udn, type, icons }, category = "renderers" }:
    DataSourceProps<UpnpDevice> & { category?: string }) {
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
        <div className="card-footer no-decoration d-flex gap-2">
            <RouteLink to={`/${category}/${udn}/browse`} glyph="stream" className="p-0" disabled>Open media</RouteLink>
        </div>
    </div>;
}