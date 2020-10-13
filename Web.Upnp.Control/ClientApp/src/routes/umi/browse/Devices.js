﻿import React from "react";
import $api from "../../../components/WebApi";
import LoadIndicator from "../../../components/LoadIndicator";
import { RouteLink } from "../../../components/NavLink";
import { withDataFetch } from "../../../components/DataFetch";
import DeviceList from "../../common/DeviceList";
//import DeviceInfo from "../../common/DeviceInfo";
import DeviceIcon from "../../common/DeviceIcon";
import PlayerWidget from "../../common/PlayerWidget";

function UmiDevice({ "data-source": { icons, name, type, description, udn } }) {
    const icon = icons?.sort((i1, i2) => i2.w - i1.w)?.find(i => i.w <= 48) || icons?.[0];
    return <div className="card">
               <div className="card-header d-flex flex-row">
                   <DeviceIcon icon={icon?.url} service={type} />
                   <div>
                       <h5 className="card-title">{name}</h5>
                       <h6 className="card-subtitle">{description}</h6>
                   </div>
               </div>
               <div className="card-body">
                   <PlayerWidget udn={udn} />
               </div>
               <div className="card-footer d-flex align-items-center gap-2 no-decoration">
                   <RouteLink to={`/umi/browse/${udn}/`} glyph="folder">Browse</RouteLink>
                   <RouteLink to={`/umi/playlist/${udn}/PL:`} glyph="list-alt">Playlists</RouteLink>
               </div>
           </div>;
}

const dataUrl = $api.discover("umi").url();
const UmiDeviceList = withDataFetch(DeviceList, { template: LoadIndicator }, () => dataUrl);

export default props => <UmiDeviceList itemTemplate={UmiDevice} {...props} />;