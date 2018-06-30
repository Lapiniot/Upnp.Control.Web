import React from "react";
import DeviceInfo from "./DeviceInfo";
import DeviceIcon from "./DeviceIcon";
import { RouteLink } from "../navigation/NavLink";

export default class UmiDevice extends React.Component {

    displayName = UmiDevice.name;

    render() {

        const { "data-source": d } = this.props;

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
            </div>
            <div className="card-footer">
                <RouteLink to={`/browse/umi/${d.udn}/`} glyph="folder" className="card-link">Browse</RouteLink>
            </div>
        </div>;
    }
}