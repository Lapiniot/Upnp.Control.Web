import React from "react";
import DeviceInfo from "./DeviceInfo";
import ServicesList from "./DeviceServiceList";
import DeviceIcon from "./DeviceIcon";

export default class UpnpDevice extends React.Component {

    displayName = UpnpDevice.name;

    render() {

        const data = this.props["data-source"];

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
                       <a className="card-link" href={data.url}>All metadata</a>
                   </div>
               </div>;
    }
}