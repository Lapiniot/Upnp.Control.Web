import React, { ElementType, PropsWithChildren, ReactNode } from "react";
import { Switch, Route } from "react-router-dom"
import { RouteComponentProps } from "react-router";
import Browser from "./BrowseRouter";
import DeviceList from "./DeviceList";
import $api from "../../components/WebApi";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import DeviceCard from "./Device.Upnp";
import { DataSourceProps, UpnpDevice } from "./Types";

type TemplatedComponentProps = { itemTemplate: ElementType<DataSourceProps<UpnpDevice>>; };

type DeviceRouterProps = PropsWithChildren<{ deviceTemplate?: ElementType<DataSourceProps<UpnpDevice>> }>
    & RouteComponentProps<{ category: string; device?: string }>

function DeviceContainer({ dataContext, itemTemplate: Template }: any) {
    return <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
        <Template data-source={dataContext?.source ?? null} />
    </div>;
}

const Device = withDataFetch<any>(DeviceContainer, ({ match: { params: { device } }, category }) =>
    withMemoKey($api.devices(category, device).fetch, `${category}|${device}`), { usePreloader: true });
const Devices = withDataFetch<any>(DeviceList as any, ({ category }) =>
    withMemoKey($api.devices(category).fetch, category), { usePreloader: false });

export default ({ match: { path, params: { category } }, deviceTemplate = DeviceCard, children }: DeviceRouterProps) => <Switch>
    {children}
    <Route path={`${path}/:device/browse`} render={props => <Browser {...props} />} />
    <Route path={`${path}/:device`} exact render={props => <Device category={category} itemTemplate={deviceTemplate} {...props} />} />
    <Route path={path} exact render={props => <Devices category={category} itemTemplate={deviceTemplate} {...props} />} />
</Switch>