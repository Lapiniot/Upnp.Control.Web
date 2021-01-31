﻿import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { withBrowserDataFetch } from "./BrowserUtils";
import BrowserCore from "./BrowserCore";

const Browser = withBrowserDataFetch(BrowserCore, false);

type DeviceRouteParams = {
    category: string;
    device: string;
};

export default ({ match: { path, params: { category } } }: RouteComponentProps<DeviceRouteParams>) => <Switch>
    <Route path={`${path}/-1`} exact render={() => <Redirect to={`/${category}`} />} />
    <Route path={`${path}/:id(.*)*`} render={props => <Browser {...props} />} />
</Switch>;