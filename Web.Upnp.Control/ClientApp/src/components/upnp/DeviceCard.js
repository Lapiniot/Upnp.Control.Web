import React from "react";
import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";

export default class DeviceCard extends React.Component {

    displayName = DeviceCard.name;

    renderIcon() {

        const icon = this.props.data.icons.find(i => i.w <= 48);

        if (icon) {
            return <img src={icon.url} className="upnp-dev-icon align-self-center" alt={this.props.data.name}/>;
        } else {
            const deviceType = this.props.data.deviceType;
            const iconClass = deviceType === "urn:schemas-upnp-org:device:MediaRenderer:1" ? "fa-tv" : "fa-server";
            return <i className={`fa ${iconClass} upnp-dev-icon align-self-center`}/>;
        }
    }

    render() {

        const data = this.props.data;

        return <div className="card">
                   <div className="card-header d-flex flex-row">
                       {this.renderIcon()}
                       <div>
                           <h5 className="card-title">{data.name}</h5>
                           <h6 className="card-subtitle">{data.description}</h6>
                       </div>
                   </div>
                   <div className="card-body">
                       <DeviceInfo data={this.props.data}/>
                       <ServicesList data={this.props.data.services} id={this.props.id}/>
                   </div>
                   <div className="card-footer">
                       <a className="card-link" href={data.url}>All metadata</a>
                   </div>
               </div>;
    }
}