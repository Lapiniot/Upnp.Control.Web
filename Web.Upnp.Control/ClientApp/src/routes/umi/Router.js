import React from "react";
import { Switch, Route } from "react-router-dom"
import UmiDeviceList from "./browse/Devices";
import UmiBrowser from "./browse/Browse";
import UmiPlaylistManager from "./playlist/Playlist";

/***** Handles all /umi/* routes *****/

export default ({ match: { url } }) =>
    <Switch>
        <Route path={url} exact render={(props) => <UmiDeviceList {...props} />} />
        <Route path={`${url}/browse`} render={(props) => <UmiBrowser {...props} />} />
        <Route path={`${url}/playlist`} render={(props) => <UmiPlaylistManager {...props} />} />
    </Switch>;