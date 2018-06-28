import React from "react";
import UmiDevice from "./UmiDevice";
import DataView from "../DataView";
import Browser from "./Browser";
import { Switch, Route } from "react-router-dom"

class UmiDeviceList extends React.Component {
    displayName = UmiDeviceList.name;

    render() {
        return <DataView dataUri="/api/discovery/umi"
                         containerTemplate={"div"}
                         containerProps={{ className: "d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4" }}
                         itemTemplate={UmiDevice}/>;
    }
}

export default class UmiDevices extends React.Component {

    displayName = UmiDevices.name;

    render() {
        return <Switch>
                   <Route path="/umi" exact component={UmiDeviceList}></Route>
                   <Route path="/umi/browse/:path" component={Browser}></Route>
               </Switch>;
    }
}