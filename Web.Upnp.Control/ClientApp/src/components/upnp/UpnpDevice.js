import React from "react";
import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";
import DeviceIcon from "./DeviceIcon";
import { RouteLink } from "../navigation/NavLink";
import Icon from "../Icon";

export default class UpnpDevice extends React.Component {

    displayName = UpnpDevice.name;

    render() {

        const { "data-source": d, "data-row-id": id } = this.props;

        const isMediaServer = d.services.some(s => s.type === "urn:schemas-upnp-org:service:ContentDirectory:1");

        return <div className="card">
                   <div className="card-header d-flex flex-row">
                       <DeviceIcon icon={d.icons.find(i => i.w <= 48)} alt={d.name} service={d.type} />
                       <div>
                           <h5 className="card-title">{d.name}</h5>
                           <h6 className="card-subtitle">{d.description}</h6>
                       </div>
                   </div>
                   <div className="card-body">
                       <DeviceInfo data-source={d} />
                       <ServicesList data-source={d.services} data-row-id={id} />
                   </div>
                   <div className="card-footer">
                       <a className="card-link d-inline-block" href={d.url}><Icon glyph="download" className="x-fa-w-2" />Metadata</a>
                       {isMediaServer && <RouteLink to={`/browse/upnp/${d.udn}`} glyph="folder" className="card-link d-inline-block">Browse</RouteLink>}
                   </div>
               </div>;
    }
}