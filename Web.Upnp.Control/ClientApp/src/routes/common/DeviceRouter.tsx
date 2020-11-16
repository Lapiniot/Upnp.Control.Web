import React, { ComponentType, PropsWithChildren } from "react";
import { Switch, Route } from "react-router-dom"
import { RouteComponentProps } from "react-router";
import Browser from "./BrowseRouter";
import $api from "../../components/WebApi";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import DeviceCard from "./Device.Upnp";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DeviceContainer, DeviceListContainer, TemplatedDataComponentProps } from "./DeviceList";

type DeviceRouterProps = PropsWithChildren<{ deviceTemplate?: ComponentType<DataSourceProps<UpnpDevice>> }>
    & RouteComponentProps<{ category: string; device?: string }>

type DeviceContainerProps = TemplatedDataComponentProps<UpnpDevice> & { category?: string; } & RouteComponentProps<{ device: string; }>;
type DeviceListContainerProps = TemplatedDataComponentProps<UpnpDevice> & { category?: string; };

const Device = withDataFetch<DeviceContainerProps, UpnpDevice>(DeviceContainer, ({ match: { params: { device } }, category }) =>
    withMemoKey($api.devices(category as string, device).fetch, `${category}|${device}`), { usePreloader: true });
const Devices = withDataFetch<DeviceListContainerProps, UpnpDevice[]>(DeviceListContainer, ({ category }) =>
    withMemoKey($api.devices(category as string).fetch, category as string), { usePreloader: false });

export default ({ match: { path, params: { category } }, deviceTemplate = DeviceCard, children }: DeviceRouterProps) => <Switch>
    {children}
    <Route path={`${path}/:device/browse`} render={props => <Browser {...props} />} />
    <Route path={`${path}/:device`} exact render={props => <Device category={category} itemTemplate={deviceTemplate} {...props} />} />
    <Route path={path} exact render={props => <Devices category={category} itemTemplate={deviceTemplate} {...props} />} />
</Switch>