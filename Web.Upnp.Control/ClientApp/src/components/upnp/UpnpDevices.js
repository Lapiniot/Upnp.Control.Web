import React from "react";
import UpnpDevice from "./UpnpDevice";
import DataView from "../DataView";

export default class UpnpDevices extends React.Component {

    displayName = UpnpDevices.name;

    render() {
        return <DataView dataUri="/api/discovery"
                         containerTemplate={"div"}
                         containerProps={{ className: "d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4" }}
                         itemTemplate={UpnpDevice} />;
    }
}