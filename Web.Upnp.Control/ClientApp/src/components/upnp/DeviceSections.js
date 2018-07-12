﻿import React from "react";
import DataView from "../DataView";
import { Switch, Route, withRouter } from "react-router-dom"
import { Browser, PlaylistBrowser } from "./browser/ContentBrowser";
import { withProps, renderWithProps, withDataFetch } from "../Extensions";
import UmiDevice from "./UmiDevice";
import UpnpDevice from "./UpnpDevice";
import LoadIndicator from "../LoadIndicator";

const containerClassName = "d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4 py-3 px-3";

class AbstractDeviceList extends React.Component {
    render() {
        return <DataView containerTemplate={"div"} containerProps={{ className: containerClassName }} {...this.props} />;
    }
}

const RoutedBrowser = withRouter(Browser);
const RoutedPlaylistBrowser = withRouter(PlaylistBrowser);
const UpnpDeviceList = withProps(withDataFetch(AbstractDeviceList, "/api/discovery/upnp", { template: LoadIndicator }), { itemTemplate: UpnpDevice });
const UmiDeviceList = withProps(withDataFetch(AbstractDeviceList, "/api/discovery/umi", { template: LoadIndicator }), { itemTemplate: UmiDevice });

function renderWithDeviceProps(Component, props) {
    return function({ match: { params: { device, id = "" } } }) {
        return <Component device={device} id={id} {...props} />;
    };
}

/***** Handles all /upnp/* routes *****/
export class UpnpSection extends React.Component {
    render() {
        const { path } = this.props.match;
        return <Switch>
                   <Route path={path} exact component={UpnpDeviceList} />
                   <Route path={`${path}/browse`} component={UpnpBrowser} />
               </Switch>;
    }
}


/***** Handles all /upnp/browse routes *****/
class UpnpBrowser extends React.Component {
    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={path} exact component={UpnpDeviceList} />
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(RoutedBrowser, { baseUrl: url })} />
               </Switch>;
    }
}

/***** Handles all /umi/* routes *****/
export class UmiSection extends React.Component {
    render() {
        const { path } = this.props.match;
        return <Switch>
                   <Route path={path} exact component={UmiDeviceList} />
                   <Route path={`${path}/browse`} component={UmiBrowser} />
                   <Route path={`${path}/playlist`} component={UmiPlaylistManager} />
               </Switch>;
    }
}

/***** Handles all /umi/browse routes *****/
class UmiBrowser extends React.Component {
    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={`${path}/browse`} exact component={UmiDeviceList} />
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(RoutedBrowser, { baseUrl: url })} />
               </Switch>;
    }
}

/***** Handles all /umi/playlist routes *****/
class UmiPlaylistManager extends React.Component {
    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(RoutedPlaylistBrowser, { baseUrl: url })} />
               </Switch>;
    }
}