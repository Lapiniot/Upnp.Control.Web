import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { withMatchProps } from "../../../components/Extensions";
import { withBrowserCore } from "../../common/BrowserCore";
import { BrowserView } from "../../common/Browser";

const Browser = withBrowserCore(BrowserView);
const UpnpRoot = () => <Redirect to="/upnp" />;
/***** Handles all /upnp/browse routes *****/
export default ({ match: { path, url } }) =>
    <Switch>
        <Route path={path} exact component={UpnpRoot} />
        <Route path={`${path}/:device/:id(.*)?`} render={withMatchProps(Browser, { baseUrl: url })} />
    </Switch>;

