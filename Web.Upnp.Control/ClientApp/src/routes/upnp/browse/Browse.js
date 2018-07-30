import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { renderWithDeviceProps, withBrowserCore } from "../../common/BrowserCore";
import { BrowserView } from "../../common/Browser";

/***** Handles all /upnp/browse routes *****/
export default class UpnpBrowser extends React.Component {

    displayName = UpnpBrowser.name;

    render() {
        const { path, url } = this.props.match;
        return <Switch>
            <Route path={path} exact render={() => <Redirect to="/upnp" />} />
            <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(Browser, { baseUrl: url })} />
        </Switch>;
    }
}

const Browser = withBrowserCore(BrowserView);