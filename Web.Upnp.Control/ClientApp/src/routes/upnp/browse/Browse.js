import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { withBrowser } from "../../common/BrowserUtils";
import BrowserView from "../../common/Browser";

const Browser = withBrowser(BrowserView, false);

/***** Handles all /upnp/browse routes *****/

export default ({ match: { path } }) => <Switch>
    <Route path={`${path}/-1`} render={() => <Redirect to="/upnp" />} />
    <Route path={`${path}/:id(.*)*`} render={props => <Browser {...props} />} />
</Switch>;