import React from "react";
import DeviceIcon from "./DeviceIcon";
import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";
import { NavLink, RouteLink } from "../../components/NavLink";

export default function Device({ "data-source": d }) {

    const isMediaServer = d.services && d.services.some(
        s => s.type.startsWith("urn:schemas-upnp-org:service:ContentDirectory:") ||
            s.type.startsWith("urn:xiaomi-com:service:Playlist:"));

    return <div className="card">
        <div className="card-header d-flex">
            <DeviceIcon service={d.type} icons={d.icons} />
            <div>
                <h5 className="card-title">{d.presentUrl ? <NavLink to={d.presentUrl}>{d.name}</NavLink> : d.name}</h5>
                <h6 className="card-subtitle">{d.description}</h6>
            </div>
        </div>
        <div className="card-body">
            <DeviceInfo data-source={d} />
            <ServicesList data-source={d.services} data-row-id={d.udn} />
        </div>
        <div className="card-footer no-decoration d-flex gap-2">
            <NavLink to={d.url} glyph="download">Metadata</NavLink>
            {isMediaServer && <RouteLink to={`/upnp/${d.udn}/browse`} glyph="folder">Browse</RouteLink>}
        </div>
    </div>;
}