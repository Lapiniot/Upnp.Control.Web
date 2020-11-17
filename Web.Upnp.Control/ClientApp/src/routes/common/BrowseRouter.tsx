import React from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { withBrowser } from "./BrowserUtils";
import BrowserView from "./Browser";

const Browser = withBrowser(BrowserView, false);

type DeviceRouteParams = {
    category: string;
    device: string;
};

type DeviceBrowseRouteParams = DeviceRouteParams & {
    id?: string;
};

export default ({ match: { path } }: RouteComponentProps<DeviceRouteParams>) => <Switch>
    <Route path={`${path}/-1`} render={() => <Redirect to="/upnp" />} />
    <Route path={`${path}/:id(.*)*`} render={(props: RouteComponentProps<DeviceBrowseRouteParams>) => <Browser history={props.history} location={props.location} match={props.match} />} />
</Switch>;