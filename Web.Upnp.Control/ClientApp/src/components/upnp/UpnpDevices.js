import React from "react";
import UpnpDevice from "./UpnpDevice";
import DataView from "../DataView";
import Browser from "./Browser";
import { Switch, Route } from "react-router-dom"

export default class UmiDevices extends React.Component {

    displayName = UmiDevices.name;

    render() {
        return <Switch>
                   <Route path="/upnp" exact render={() => <DataView dataUri="/api/discovery" containerTemplate={"div"}
                        containerProps={{ className: "d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4" }}
                        itemTemplate={UpnpDevice} />}/>
                   <Route path="/upnp/browse/:path" component={Browser}/>
               </Switch>;
    }
}