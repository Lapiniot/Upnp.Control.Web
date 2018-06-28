import React from "react";
import DeviceInfo from "./DeviceInfo";
import DeviceIcon from "./DeviceIcon";
import { RouteLink } from "../navigation/NavLink";

export default class UmiDevice extends React.Component {

    displayName = UmiDevice.name;

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
                   </div>
                   <div className="card-footer">
                       <RouteLink to={`/umi/browse/${data.udn}`} glyph="folder"
                                  className="card-link">Browse
                       </RouteLink>
                   </div>
               </div>;
    }
}