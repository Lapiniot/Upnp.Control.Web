import React from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { withBrowser } from "./BrowserUtils";
import BrowserView from "./Browser";

const Browser = withBrowser(BrowserView, false);

export default ({ match: { path } }: RouteComponentProps) => <Switch>
    <Route path={`${path}/-1`} render={() => <Redirect to="/upnp" />} />
    <Route path={`${path}/:id(.*)*`} render={props => <Browser {...props} />} />
</Switch>;