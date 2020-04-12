import React from "react";
import { Switch, Route, Redirect } from "react-router-dom"
import Playlist from "./PlaylistManager";

/***** Handles all /umi/playlist routes *****/

const umiRoot = () => <Redirect to="/umi" />;

export default ({ match: { path, url } }) =>
    <Switch>
        <Route path={path} exact render={umiRoot} />
        <Route path={`${path}/:device/0`} render={umiRoot} />
        <Route path={`${path}/:device/:id(.*)?`} render={props => <Playlist baseUrl={url} {...props} />} />
    </Switch>;