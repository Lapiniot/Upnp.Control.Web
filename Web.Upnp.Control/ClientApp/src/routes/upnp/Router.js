import React from "react";
import { Switch, Route, withRouter, Redirect } from "react-router-dom"
import { withProps, withDataFetch } from "../../components/common/Extensions";
import UpnpDevices from "./browse/Devices";
import UpnpBrowser from "./browse/Browse";

/***** Handles all /upnp/* routes *****/
export default class Router extends React.Component {

    displayName = Router.name;

    render() {
        const { path } = this.props.match;
        return <Switch>
                   <Route path={path} exact component={UpnpDevices} />
                   <Route path={`${path}/browse`} component={UpnpBrowser} />
               </Switch>;
    }
}