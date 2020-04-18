import React from "react";
import { Switch, Route, Redirect } from "react-router-dom"
import Playlist from "./PlaylistManager";

/***** Handles all /umi/playlist routes *****/

export default ({ match: { path } }) =>
    <Switch>
        <Redirect from={path} exact to="/umi" />
        <Route path={`${path}/:device/:id*`} render={props =>
            props.match.params.id !== "0" && props.match.params.id !== "-1"
                ? <Playlist {...props} />
                : <Redirect to="/umi" />} />
    </Switch>;