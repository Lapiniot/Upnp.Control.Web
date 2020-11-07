import React from "react";
import { Switch, Route } from "react-router-dom"
import Browser from "./BrowseRouter";
import DeviceList from "./DeviceList";
import $api from "../../components/WebApi";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import DeviceCard from "./Device.Upnp";

function DeviceContainer({ dataContext: { source }, itemTemplate: Template }) {
    return <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
        <Template data-source={source} />
    </div>;
}

const Device = withDataFetch(DeviceContainer, ({ match: { params: { device } }, category = "upnp" }) =>
    withMemoKey($api.devices(category, device).fetch, `${category}|${device}`), { usePreloader: true });
const Devices = withDataFetch(DeviceList, ({ category }) =>
    withMemoKey($api.devices(category).fetch, category), { usePreloader: false });

export default ({ match: { path }, children, deviceTemplate = DeviceCard, ...other }) => <Switch>
    {children}
    <Route path={`${path}/:device/browse`} render={props => <Browser {...other} {...props} />} />
    <Route path={`${path}/:device`} exact render={props => <Device itemTemplate={deviceTemplate} {...other} {...props} />} />
    <Route path={path} exact render={props => <Devices itemTemplate={deviceTemplate} {...other} {...props} />} />
</Switch>;