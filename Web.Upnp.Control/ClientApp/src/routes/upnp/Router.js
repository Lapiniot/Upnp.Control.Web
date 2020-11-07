import React from "react";
import { Switch, Route } from "react-router-dom"
import Browser from "./browse/Browse";
import DeviceList from "../common/DeviceList";
import $api from "../../components/WebApi";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import DeviceCard from "../common/Device.Upnp";

function DeviceContainer({ dataContext: { source } }) {
    return <div className="d-flex m-3 justify-content-center"><DeviceCard data-source={source} /></div>;
}

const devicesFetch = $api.devices("upnp").fetch;

const Device = withDataFetch(DeviceContainer, ({ match: { params: { device } } }) =>
    withMemoKey($api.devices("upnp", device).fetch, device), { usePreloader: true });
const Devices = withDataFetch(DeviceList, () => devicesFetch, { usePreloader: false });

export default ({ match: { path } }) =>
    <Switch>
        <Route path={path} exact render={props => <Devices itemTemplate={DeviceCard} {...props} />} />
        <Route path={`${path}/:device/browse`} render={props => <Browser {...props} />} />
        <Route path={`${path}/:device`} render={props => <Device {...props} />} />
    </Switch>;