import React from "react";
import DataView from "../DataView";
import { Switch, Route, NavLink } from "react-router-dom"
import UmiDevice from "./UmiDevice";
import UpnpDevice from "./UpnpDevice";

export default class DeviceBrowser extends React.Component {

    displayName = DeviceBrowser.name;

    render() {
        const { path, url, params: { category } } = this.props.match;
        return <Switch>
                   <Route path={path} exact render={getDeviceList(category)} />
                   <Route path={`${path}/:device/:id?`} render={getBrowser(url)} />
               </Switch>;
    }
}

const templates = { "umi": UmiDevice, "upnp": UpnpDevice };

class DIDLItem extends React.Component {

    displayName = DIDLItem.name;

    render() {
        const { "data-source": data, base, ...other } = this.props;
        return <div>
                   <NavLink to={`${base}/${data.id}`} {...other}>{data.title}</NavLink>
               </div>;
    }
}

function getBrowser(url) {
    return function({ match: { params: { device, id } } = {} }) {
        return <DataView dataUri={`/api/browse/${device}/${id}`}
                         containerTemplate="div"
                         itemTemplate={DIDLItem}
                         itemProps={{ base: `${url}/${device}` }} />;
    };
}

function getDeviceList(category) {
    return function() {
        return <DataView dataUri={`/api/discovery/${category}`}
                         containerTemplate={"div"}
                         className="d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4"
                         itemTemplate={templates[category]} />;
    };
}