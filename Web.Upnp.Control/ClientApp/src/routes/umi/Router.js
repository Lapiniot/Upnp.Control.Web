import React from "react";
import { Route, Redirect } from "react-router-dom"
import PlaylistManager from "./playlist/PlaylistManager";
import DeviceRouter from "../common/DeviceRouter";
import UmiDeviceCard from "../common/Device.Umi";

export default (props) => <DeviceRouter {...props} category="umi" deviceTemplate={UmiDeviceCard}>
    <Route path={`${props.match.path}/:device/playlists/(0|-1)`} exact render={() => <Redirect to="/umi" />} />
    <Route path={`${props.match.path}/:device/playlists/:id(.*)*`} render={({ id = "PL:", ...other }) => <PlaylistManager {...other} id={id} />} />
</DeviceRouter>