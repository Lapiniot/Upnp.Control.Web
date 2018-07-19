import React from "react";
import DataView from "../DataView";
import { Switch, Route, withRouter, Redirect } from "react-router-dom"
import { withProps, withDataFetch } from "../common/Extensions";
import Browser from "./browser/content/Browser";
import PlaylistManager from "./browser/playlist/PlaylistManager";
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
const RoutedPlaylistBrowser = withRouter(PlaylistManager);
const UpnpDeviceList = withProps(withDataFetch(AbstractDeviceList, { template: LoadIndicator }), { dataUrl: "/api/discovery/upnp", itemTemplate: UpnpDevice });
const UmiDeviceList = withProps(withDataFetch(AbstractDeviceList, { template: LoadIndicator }), { dataUrl: "/api/discovery/umi", itemTemplate: UmiDevice });

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
                   <Route path={path} exact component={UmiDeviceList} />
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(RoutedBrowser, { baseUrl: url })} />
               </Switch>;
    }
}

/***** Handles all /umi/playlist routes *****/
class UmiPlaylistManager extends React.Component {
    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={() => <Redirect to="/umi" />} />
                   <Route path={`${path}/:device/0`} render={() => <Redirect to="/umi" />} />
                   <Route path={`${path}/:device/:id(.*)?`} render={renderWithDeviceProps(RoutedPlaylistBrowser, { baseUrl: url })} />
               </Switch>;
    }
}