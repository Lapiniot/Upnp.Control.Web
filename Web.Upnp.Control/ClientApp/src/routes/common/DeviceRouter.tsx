﻿import React, { ComponentType, PropsWithChildren } from "react";
import { Switch, Route } from "react-router-dom"
import { RouteComponentProps } from "react-router";
import Browser from "./BrowseRouter";
import $api from "../../components/WebApi";
import { DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import DeviceCard from "./Device.Upnp";
import { DataSourceProps, UpnpDevice } from "./Types";
import { DeviceContainer, DeviceListContainer, TemplatedDataComponentProps } from "./DeviceList";

type CategoryParams = { category: string }
type DeviceParams = { device: string }

type DeviceRouterProps = PropsWithChildren<{ deviceTemplate?: ComponentType<DataSourceProps<UpnpDevice>> }>
    & RouteComponentProps<CategoryParams>

const Device = withDataFetch<DataFetchProps<UpnpDevice> & TemplatedDataComponentProps<UpnpDevice>, CategoryParams & DeviceParams>(
    DeviceContainer, ({ device, category }) => withMemoKey($api.devices(category, device).jsonFetch, `${category}|${device}`));

const Devices = withDataFetch<DataFetchProps<UpnpDevice[]> & TemplatedDataComponentProps<UpnpDevice>, CategoryParams>(
    DeviceListContainer, ({ category }) => withMemoKey($api.devices(category).jsonFetch, category as string),
    { usePreloader: false });

export default ({ match: { path, params: { category } }, deviceTemplate = DeviceCard, children }: DeviceRouterProps) => <Switch>
    {children}
    <Route path={`${path}/:device/browse`} render={props => <Browser {...props} />} />
    <Route path={`${path}/:device`} exact render={({ match: { params: { device } } }: RouteComponentProps<CategoryParams & DeviceParams>) =>
        <Device category={category} itemTemplate={deviceTemplate} device={device} />} />
    <Route path={path} exact render={() => <Devices category={category} itemTemplate={deviceTemplate} />} />
</Switch>