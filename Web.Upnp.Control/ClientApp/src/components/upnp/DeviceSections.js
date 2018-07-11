import React from "react";
import DataView from "../DataView";
import { Switch, Route, withRouter } from "react-router-dom"
import { Browser, PlaylistBrowser, withDeviceRoute } from "./browser/ContentBrowser";
import UmiDevice from "./UmiDevice";
import UpnpDevice from "./UpnpDevice";

const templates = { "umi": UmiDevice, "upnp": UpnpDevice };

const RoutedBrowser = withRouter(Browser);
const RoutedPlaylistBrowser = withRouter(PlaylistBrowser);

/***** Handles all /upnp/* routes *****/
export class UpnpSection extends React.Component {
    render() {
        const { path } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={getDeviceList("upnp")} />
                   <Route path={`${path}/browse`} component={UpnpBrowser} />
               </Switch>;
    }
}


/***** Handles all /upnp/browse routes *****/
class UpnpBrowser extends React.Component {
    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={getDeviceList("upnp")} />
                   <Route path={`${path}/:device/:id(.*)?`} render={withDeviceRoute(RoutedBrowser, { baseUrl: url })} />
               </Switch>;
    }
}

/***** Handles all /umi/* routes *****/
export class UmiSection extends React.Component {
    render() {
        const { path } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={getDeviceList("umi")} />
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
                   <Route path={`${path}/browse`} exact render={getDeviceList("umi")} />
                   <Route path={`${path}/:device/:id(.*)?`} render={withDeviceRoute(RoutedBrowser, { baseUrl: url })} />
               </Switch>;
    }
}

/***** Handles all /umi/playlist routes *****/
class UmiPlaylistManager extends React.Component {
    render() {
        const { path, url } = this.props.match;
        return <Switch>
                   <Route path={`${path}/:device/:id(.*)?`} render={withDeviceRoute(RoutedPlaylistBrowser, { baseUrl: url })} />
               </Switch>;
    }
}

function getDeviceList(category) {
    return function() {
        return <DataView dataUri={`/api/discovery/${category}`}
                         containerTemplate={"div"} containerProps={{ className: "d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4 py-3 px-3" }}
                         itemTemplate={templates[category]} />;
    };
}