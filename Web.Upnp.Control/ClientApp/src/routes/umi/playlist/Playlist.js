import React from "react";
import { Switch, Route, Redirect } from "react-router-dom"
import { RoutedPlaylistManager } from "./PlaylistManager";
import { withMatchProps } from "../../../components/Extensions";

/***** Handles all /umi/playlist routes *****/
export default ({ match: { path, url } }) =>
    <Switch>
        <Route path={path} exact render={() => <Redirect to="/umi" />} />
        <Route path={`${path}/:device/0`} render={() => <Redirect to="/umi" />} />
        <Route path={`${path}/:device/:id(.*)?`} render={withMatchProps(RoutedPlaylistManager, { baseUrl: url })} />
    </Switch>;