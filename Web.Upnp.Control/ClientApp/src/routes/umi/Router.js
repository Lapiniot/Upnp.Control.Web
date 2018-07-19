import React from "react";
import { Switch, Route, withRouter, Redirect } from "react-router-dom"
import { withProps, withDataFetch } from "../../components/common/Extensions";
import UmiDevice from "./UmiDevice";
import LoadIndicator from "../../components/LoadIndicator";
import DeviceList from "../common/DeviceList";
import UmiBrowser from "./browse/Browse";
import UmiPlaylistManager from "./playlist/Playlist";

const UmiDeviceList = withProps(withDataFetch(DeviceList, { template: LoadIndicator }), { dataUrl: "/api/discovery/umi", itemTemplate: UmiDevice });

/***** Handles all /umi/* routes *****/
export default class Router extends React.Component {

    displayName = Router.name;

    render() {
        const { path } = this.props.match;
        return <Switch>
                   <Route path={path} exact component={UmiDeviceList} />
                   <Route path={`${path}/browse`} component={UmiBrowser} />
                   <Route path={`${path}/playlist`} component={UmiPlaylistManager} />
               </Switch>;
    }
}