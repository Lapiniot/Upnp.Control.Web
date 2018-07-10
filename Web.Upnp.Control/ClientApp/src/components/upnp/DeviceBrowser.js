import React from "react";
import DataView from "../DataView";
import { Switch, Route, withRouter } from "react-router-dom"
import { Browser, PlaylistBrowser } from "./browser/ContentBrowser";
import UmiDevice from "./UmiDevice";
import UpnpDevice from "./UpnpDevice";

const templates = { "umi": UmiDevice, "upnp": UpnpDevice };

const RoutedBrowser = withRouter(Browser);
const RoutedPlaylistBrowser = withRouter(PlaylistBrowser);

export default class DeviceBrowser extends React.Component {

    displayName = DeviceBrowser.name;

    render() {
        const { path, url, params: { category } } = this.props.match;
        return <Switch>
            <Route path={path} exact render={getDeviceList(category)} />
            <Route path={`${path}-playlist/:device/:id(.*)?`} render={getPlaylistManager(url)} />
            <Route path={`${path}/:device/:id(.*)?`} render={getBrowser(url)} />
        </Switch>;
    }
}

function getBrowser(url) {
    return function ({ match: { params: { device, id = "" } } = {} }) {
        return <RoutedBrowser baseUrl={url} device={device} id={id} />;
    };
}

function getPlaylistManager(url) {
    return function ({ match: { params: { device, id = "" } } = {} }) {
        return <RoutedPlaylistBrowser baseUrl={url} device={device} id={id} />;
    };
}

function getDeviceList(category) {
    return function () {
        return <DataView dataUri={`/api/discovery/${category}`}
            containerTemplate={"div"} containerProps={{ className: "d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4 py-3 px-3" }}
            itemTemplate={templates[category]} />;
    };
}