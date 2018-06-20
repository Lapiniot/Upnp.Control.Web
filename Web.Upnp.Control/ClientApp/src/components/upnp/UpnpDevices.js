import React from "react";
import DeviceCard from "./DeviceCard";
import DataView from "../DataView";

export default class UpnpDevices extends React.Component {

    displayName = UpnpDevices.name;

    render() {
        return <DataView dataUri="/api/discovery"
                         containerTemplate={"div"}
                         containerProps={{ className: "grid" }}
                         itemTemplate={DeviceCard} />;
    }
}