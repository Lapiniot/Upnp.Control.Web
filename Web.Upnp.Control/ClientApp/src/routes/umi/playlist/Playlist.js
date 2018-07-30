import React from "react";
import { Switch, Route, Redirect } from "react-router-dom"
import { RoutedPlaylistManager } from "./PlaylistManager";
import { renderWithDeviceProps } from "../../common/BrowserCore";

/***** Handles all /umi/playlist routes *****/
export default class UmiPlaylistManager extends React.Component {

    displayName = UmiPlaylistManager.name;

    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={() => <Redirect to="/umi" />} />
                   <Route path={`${path}/:device/0`} render={() => <Redirect to="/umi" />} />
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(RoutedPlaylistManager, { baseUrl: url })} />
               </Switch>;
    }
}