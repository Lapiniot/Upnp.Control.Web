import React from "react";
import $api from "../../../components/WebApi";
import LoadIndicator from "../../../components/LoadIndicator";
import { RouteLink } from "../../../components/NavLink";
import { withProps, withDataFetch } from "../../../components/Extensions";
import DeviceList from "../../common/DeviceList";
import DeviceInfo from "../../common/DeviceInfo";
import DeviceIcon from "../../common/DeviceIcon";

const UmiDevice = ({ "data-source": d, "data-source": { icons, name, type, description, udn } }) =>
    <div className="card">
        <div className="card-header d-flex flex-row">
            <DeviceIcon icon={icons && icons.find(i => i.w <= 48)} alt={name} service={type} />
            <div>
                <h5 className="card-title">{name}</h5>
                <h6 className="card-subtitle">{description}</h6>
            </div>
        </div>
        <div className="card-body">
            <DeviceInfo data-source={d} />
        </div>
        <div className="card-footer">
            <RouteLink to={`/umi/browse/${udn}/`} glyph="folder" className="card-link">Browse</RouteLink>
            <RouteLink to={`/umi/playlist/${udn}/PL:`} glyph="list-alt" className="card-link">Playlists</RouteLink>
        </div>
    </div>;

const UmiDeviceList = withProps(
    withDataFetch(DeviceList, { template: LoadIndicator }),
    {
        dataUrl: $api.discover("umi").url(),
        itemTemplate: UmiDevice
    });

export default UmiDeviceList;