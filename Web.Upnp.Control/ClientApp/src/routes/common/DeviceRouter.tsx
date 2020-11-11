import React, { ElementType, PropsWithChildren, ReactNode } from "react";
import { Switch, Route } from "react-router-dom"
import { RouteComponentProps } from "react-router";
import Browser from "./BrowseRouter";
import DeviceList from "./DeviceList";
import $api from "../../components/WebApi";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import DeviceCard from "./Device.Upnp";

interface DeviceContainerProps {
    dataContext: { source: object };
    itemTemplate: ElementType<{ "data-source": object }>
}

function DeviceContainer({ dataContext: { source }, itemTemplate: Template }: DeviceContainerProps) {
    return <div className="d-grid grid-auto-x3 align-items-start justify-content-evenly m-3">
        <Template data-source={source} />
    </div>;
}

const Device = withDataFetch(DeviceContainer, ({ match: { params: { device } }, category }) =>
    withMemoKey($api.devices(category, device).fetch, `${category}|${device}`), { usePreloader: true });
const Devices = withDataFetch(DeviceList, ({ category }) =>
    withMemoKey($api.devices(category).fetch, category), { usePreloader: false });

export interface DeviceRouterProps extends
    PropsWithChildren<{ category?: string, deviceTemplate?: ElementType<any> }>,
    RouteComponentProps<{}> {
}

export default ({ match: { path }, deviceTemplate = DeviceCard, category = "upnp", children }: DeviceRouterProps) => <Switch>
    {children}
    <Route path={`${path}/:device/browse`} render={props => <Browser {...props} />} />
    <Route path={`${path}/:device`} exact render={props => <Device category={category} itemTemplate={deviceTemplate} {...props} />} />
    <Route path={path} exact render={props => <Devices category={category} itemTemplate={deviceTemplate} {...props} />} />
</Switch>