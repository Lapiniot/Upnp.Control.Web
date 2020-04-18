import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { withBrowser } from "../../common/BrowserUtils";
import BrowserCore from "../../common/BrowserCore";
import Devices from "./Devices";

const Browser = withBrowser(BrowserCore);

/***** Handles all /upnp/browse routes *****/

export default ({ match: { path } }) =>
    <Switch>
        <Route path={path} exact render={props => <Devices {...props} />} />
        <Route path={`${path}/:device/:id*`} render={props => props.match.params.id !== "-1"
            ? <Browser {...props} />
            : <Redirect to={path} />} />
    </Switch>;