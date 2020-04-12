import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { withBrowserCore } from "../../common/BrowserCore";
import { BrowserView } from "../../common/Browser";

const Browser = withBrowserCore(BrowserView);
const umiRoot = () => <Redirect to="/umi" />;

/***** Handles all /umi/browse routes *****/

export default ({ match: { path, url } }) =>
    <Switch>
        <Route path={path} exact render={umiRoot} />
        <Route path={`${path}/:device/:id(.*)?`} render={({ match: { params } }) => <Browser baseUrl={url} {...params} />} />
    </Switch>;