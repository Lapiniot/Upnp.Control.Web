import React from "react";
import { Switch, Route, Redirect } from "react-router-dom"
import Playlist from "./PlaylistManager";

/***** Handles all /umi/playlist routes *****/

const umiRoot = () => <Redirect to="/umi" />;

export default ({ match: { url } }) =>
    <Switch>
        <Route path={url} exact render={umiRoot} />
        <Route path={`${url}/:device/0`} render={umiRoot} />
        <Route path={`${url}/:device/:id(.*)?`} render={({ match: { params } }) => <Playlist baseUrl={url} {...params} />} />
    </Switch>;