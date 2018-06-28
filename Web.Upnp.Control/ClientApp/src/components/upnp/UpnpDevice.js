import React from "react";
import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";
import DeviceIcon from "./DeviceIcon";
import { RouteLink } from "../navigation/NavLink";
import Icon from "../Icon";

export default class UpnpDevice extends React.Component {

    displayName = UpnpDevice.name;

    render() {

        const data = this.props["data-source"];

        const isMediaServer = data.services.some(s => s.type === "urn:schemas-upnp-org:service:ContentDirectory:1");

        return <div className="card">
                   <div className="card-header d-flex flex-row">
                       <DeviceIcon icon={data.icons.find(i => i.w <= 48)} alt={data.name} service={data.type}/>
                       <div>
                           <h5 className="card-title">{data.name}</h5>
                           <h6 className="card-subtitle">{data.description}</h6>
                       </div>
                   </div>
                   <div className="card-body">
                       <DeviceInfo data={data}/>
                       <ServicesList data-source={data.services} data-id={this.props["data-id"]}/>
                   </div>
                   <div className="card-footer">
                       <a className="card-link d-inline-block" href={data.url}><Icon glyph="file-download" className="x-fa-w-2"/>All metadata</a>
                       {isMediaServer && <RouteLink to={`/upnp/browse/${data.udn}`} glyph="folder" className="card-link d-inline-block">Browse</RouteLink>}
                   </div>
               </div>;
    }
}