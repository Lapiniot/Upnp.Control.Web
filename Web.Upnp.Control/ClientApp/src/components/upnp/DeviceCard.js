import React from "react";
import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";

class DeviceIcon extends React.Component {
    render() {
        if (this.props.icon) {
            return <img src={this.props.icon.url} className="upnp-dev-icon align-self-center"
                        alt={this.props.alt || "[device icon]"} />;
        } else {
            const iconClass = this.props.service === "urn:schemas-upnp-org:device:MediaRenderer:1" ? "tv" : "server";
            return <i className={`fa fa-${iconClass} upnp-dev-icon align-self-center`} />;
        }
    }
}

export default class DeviceCard extends React.Component {

    displayName = DeviceCard.name;

    render() {

        const data = this.props["data-source"];

        return <div className="card">
                   <div className="card-header d-flex flex-row">
                       <DeviceIcon icon={data.icons.find(i => i.w <= 48)} alt={data.name} service={data.serviceType} />
                       <div>
                           <h5 className="card-title">{data.name}</h5>
                           <h6 className="card-subtitle">{data.description}</h6>
                       </div>
                   </div>
                   <div className="card-body">
                       <DeviceInfo data={data} />
                       <ServicesList data-source={data.services} data-id={this.props["data-id"]} />
                   </div>
                   <div className="card-footer">
                       <a className="card-link" href={data.url}>All metadata</a>
                   </div>
               </div>;
    }
}