import React from "react";
import { Switch, Route } from "react-router-dom"
import UmiDeviceList from "./browse/Devices";
import UmiBrowser from "./browse/Browse";
import UmiPlaylistManager from "./playlist/Playlist";

/***** Handles all /umi/* routes *****/

export default ({ match: { path } }) =>
    <Switch>
        <Route path={path} exact render={props => <UmiDeviceList {...props} />} />
        <Route path={`${path}/browse`} render={props => <UmiBrowser {...props} />} />
        <Route path={`${path}/playlist`} render={props => <UmiPlaylistManager {...props} />} />
    </Switch>;