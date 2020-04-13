import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { withBrowserCore } from "../../common/BrowserCore";
import { BrowserView } from "../../common/Browser";
import Devices from "./Devices";
const Browser = withBrowserCore(BrowserView);

/***** Handles all /upnp/browse routes *****/

export default ({ match: { path } }) =>
    <Switch>
        <Route path={path} exact render={props => <Devices {...props} />} />
        <Route path={`${path}/:device/:id(.*)?`} render={props => props.match.params.id !== "-1"
            ? <Browser {...props} />
            : <Redirect to={path} />} />
    </Switch>;