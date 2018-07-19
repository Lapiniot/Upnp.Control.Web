import React from "react";
import { Switch, Route, withRouter, Redirect } from "react-router-dom"
import Browser from "../../common/Browser";

const RoutedBrowser = withRouter(Browser);

function renderWithDeviceProps(Component, props) {
    return function({ match: { params: { device, id = "" } } }) {
        return <Component device={device} id={id} {...props} />;
    };
}

/***** Handles all /upnp/browse routes *****/
export default class UpnpBrowser extends React.Component {

    displayName = UpnpBrowser.name;

    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={() => <Redirect to="/upnp" />} />
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(RoutedBrowser, { baseUrl: url })} />
               </Switch>;
    }
}