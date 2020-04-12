import React from "react";
import { Switch, Route } from "react-router-dom"
import UpnpDevices from "./browse/Devices";
import UpnpBrowser from "./browse/Browse";

/***** Handles all /upnp/* routes *****/

export default ({ match: { path } }) =>
    <Switch>
        <Route path={path} exact render={(props) => <UpnpDevices {...props} />} />
        <Route path={`${path}/browse`} render={(props) => <UpnpBrowser {...props} />} />
    </Switch>;