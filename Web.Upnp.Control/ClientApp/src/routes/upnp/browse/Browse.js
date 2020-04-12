import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { withBrowserCore } from "../../common/BrowserCore";
import { BrowserView } from "../../common/Browser";

const Browser = withBrowserCore(BrowserView);
const upnpRoot = () => <Redirect to="/upnp" />;

/***** Handles all /upnp/browse routes *****/

export default ({ match: { path, url } }) =>
    <Switch>
        <Route path={path} exact render={upnpRoot} />
        <Route path={`${path}/:device/:id(.*)?`} render={({ match: { params } }) => <Browser baseUrl={url} {...params} />} />
    </Switch>;

