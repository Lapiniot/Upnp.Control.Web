import React from "react";
import { withDataFetch } from "../../../components/DataFetch";
import $api from "../../../components/WebApi";
import LoadIndicator from "../../../components/LoadIndicator";
import { NavLink, RouteLink } from "../../../components/NavLink";
import DeviceInfo from "../../common/DeviceInfo";
import DeviceIcon from "../../common/DeviceIcon";
import ServicesList from "../../common/DeviceServiceList";
import DeviceList from "../../common/DeviceList";

function UpnpDevice({ "data-source": d}) {

    const isMediaServer = d.services && d.services.some(
        s => s.type.startsWith("urn:schemas-upnp-org:service:ContentDirectory:") ||
            s.type.startsWith("urn:xiaomi-com:service:Playlist:"));

    return <div className="card">
        <div className="card-header d-flex">
            <DeviceIcon service={d.type} icons={d.icons} />
            <div>
                <h5 className="card-title">{d.name}</h5>
                <h6 className="card-subtitle">{d.description}</h6>
            </div>
        </div>
        <div className="card-body">
            <DeviceInfo data-source={d} />
            <ServicesList data-source={d.services} data-row-id={d.udn} />
        </div>
        <div className="card-footer no-decoration d-flex gap-2">
            <NavLink to={d.url} glyph="download">Metadata</NavLink>
            {isMediaServer && <RouteLink to={`/upnp/browse/${d.udn}`} glyph="folder">Browse</RouteLink>}
        </div>
    </div>;
}

const dataUrl = $api.devices("upnp").url();

const UpnpDevices = withDataFetch(DeviceList, { template: LoadIndicator }, () => dataUrl);

export default props => <UpnpDevices itemTemplate={UpnpDevice} {...props} />;