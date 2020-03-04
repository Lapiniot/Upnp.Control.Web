import React from "react";
import { Switch, Route } from "react-router-dom"
import UmiDeviceList from "./browse/Devices";
import UmiBrowser from "./browse/Browse";
import UmiPlaylistManager from "./playlist/Playlist";

/***** Handles all /umi/* routes *****/
export default ({ match: { path } }) =>
    <Switch>
        <Route path={path} exact component={UmiDeviceList} />
        <Route path={`${path}/browse`} component={UmiBrowser} />
        <Route path={`${path}/playlist`} component={UmiPlaylistManager} />
    </Switch>;