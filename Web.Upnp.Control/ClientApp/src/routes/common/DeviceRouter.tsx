import React, { ComponentType, PropsWithChildren } from "react";
import { Switch, Route } from "react-router-dom"
import { RouteComponentProps } from "react-router";
import Browser from "./BrowseRouter";
import $api from "../../components/WebApi";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import DeviceCard from "./Device.Upnp";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DeviceContainer, DeviceListContainer } from "./DeviceList";

type DeviceRouterProps = PropsWithChildren<{ deviceTemplate?: ComponentType<DataSourceProps<UpnpDevice>> }>
    & RouteComponentProps<{ category: string; device?: string }>

const Device = withDataFetch(DeviceContainer, ({ device, category }) => withMemoKey($api.devices(category as string, device).jsonFetch, `${category}|${device}`), { usePreloader: true });
const Devices = withDataFetch(DeviceListContainer, ({ category }) => withMemoKey($api.devices(category as string).jsonFetch, category as string), { usePreloader: false });

export default ({ match: { path, params: { category } }, deviceTemplate = DeviceCard, children }: DeviceRouterProps) => <Switch>
    {children}
    <Route path={`${path}/:device/browse`} render={props => <Browser {...props} />} />
    <Route path={`${path}/:device`} exact render={({ match: { params: { device } } }: RouteComponentProps<{ category: string; device: string }>) => <Device category={category} itemTemplate={deviceTemplate} device={device} />} />
    <Route path={path} exact render={() => <Devices category={category} itemTemplate={deviceTemplate} />} />
</Switch>