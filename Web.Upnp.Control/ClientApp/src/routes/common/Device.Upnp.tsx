import React from "react";
import DeviceIcon from "./DeviceIcon";
import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";
import { NavLink, RouteLink } from "../../components/NavLink";
import { DataSourceProps, Services, UpnpDevice } from "./Types";

export default function Device({ "data-source": d, category = "upnp" }: DataSourceProps<UpnpDevice> & { category?: string }) {

    const isMediaServer = d.services && d.services.some(
        s => s.type.startsWith(Services.ContentDirectory) || s.type.startsWith(Services.UmiPlaylist));

    return <div className="card shadow">
        <div className="card-header d-flex">
            <DeviceIcon service={d.type} icons={d.icons} />
            <div>
                <h5 className="card-title">{d.presentUrl ? <NavLink to={d.presentUrl} className="p-0">{d.name}</NavLink> : d.name}</h5>
                <h6 className="card-subtitle">{d.description}</h6>
            </div>
        </div>
        <div className="card-body">
            <DeviceInfo data-source={d} />
            <ServicesList data-source={d.services} data-row-id={d.udn} />
        </div>
        <div className="card-footer no-decoration d-flex gap-2">
            <NavLink to={d.url} glyph="download" className="p-0">Metadata</NavLink>
            {isMediaServer && <RouteLink to={`/${category}/${d.udn}/browse`} glyph="folder" className="p-0">Browse</RouteLink>}
        </div>
    </div>;
}