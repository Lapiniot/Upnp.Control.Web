import React from "react";
import { Switch, Route, withRouter, Redirect } from "react-router-dom"
import PlaylistManager from "./PlaylistManager";

const RoutedPlaylistBrowser = withRouter(PlaylistManager);

function renderWithDeviceProps(Component, props) {
    return function({ match: { params: { device, id = "" } } }) {
        return <Component device={device} id={id} {...props} />;
    };
}

/***** Handles all /umi/playlist routes *****/
export default class UmiPlaylistManager extends React.Component {

    displayName = UmiPlaylistManager.name;

    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={() => <Redirect to="/umi" />} />
                   <Route path={`${path}/:device/0`} render={() => <Redirect to="/umi" />} />
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(RoutedPlaylistBrowser, { baseUrl: url })} />
               </Switch>;
    }
}