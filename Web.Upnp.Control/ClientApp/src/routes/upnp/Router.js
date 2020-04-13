import React from "react";
import { Switch, Route } from "react-router-dom"
import Devices from "./browse/Devices";
import Browser from "./browse/Browse";

/***** Handles all /upnp/* routes *****/

export default ({ match: { path } }) =>
    <Switch>
        <Route path={path} exact render={props => <Devices {...props} />} />
        <Route path={`${path}/browse`} render={props => <Browser {...props} />} />
    </Switch>;