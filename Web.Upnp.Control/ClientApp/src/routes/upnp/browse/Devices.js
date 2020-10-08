import React from "react";
import { withDataFetch } from "../../../components/DataFetch";
import $api from "../../../components/WebApi";
import LoadIndicator from "../../../components/LoadIndicator";
import { RouteLink } from "../../../components/NavLink";
import DeviceInfo from "../../common/DeviceInfo";
import DeviceIcon from "../../common/DeviceIcon";
import ServicesList from "../../common/DeviceServiceList";
import DeviceList from "../../common/DeviceList";

function UpnpDevice({ "data-source": d, "data-row-id": id }) {

    const isMediaServer = d.services && d.services.some(
        s => s.usn === "urn:upnp-org:serviceId:ContentDirectory" || s.usn === "urn:xiaomi-com:serviceId:Playlist");

    return <div className="card">
        <div className="card-header d-flex">
            <DeviceIcon icon={d.icons && d.icons.find(i => i.w <= 48)} alt={d.name} service={d.type} />
            <div>
                <h5 className="card-title">{d.name}</h5>
                <h6 className="card-subtitle">{d.description}</h6>
            </div>
        </div>
        <div className="card-body">
            <DeviceInfo data-source={d} />
            <ServicesList data-source={d.services} data-row-id={id} />
        </div>
        <div className="card-footer no-decoration d-flex justify-content-end">
            <a href={d.url}><i className="fas x-fa-w-2 fa-download" />Metadata</a>
            {isMediaServer && <RouteLink to={`/upnp/browse/${d.udn}`} glyph="folder">Browse</RouteLink>}
        </div>
    </div>;
}

const dataUrl = $api.discover("upnp").url();

const UpnpDevices = withDataFetch(DeviceList, { template: LoadIndicator }, () => dataUrl);

export default props => <UpnpDevices itemTemplate={UpnpDevice} {...props} />;