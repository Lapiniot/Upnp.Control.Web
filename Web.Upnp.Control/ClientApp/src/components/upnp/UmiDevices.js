import React from "react";
import DeviceCard from "./DeviceCard";
import DataView from "../DataView";

export default class UmiDevices extends React.Component {

    displayName = UmiDevices.name;

    render() {
        return <DataView dataUri="/api/discovery/umi"
                         containerTemplate={"div"}
                         containerProps={{ className: "d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4" }}
                         itemTemplate={DeviceCard} />;
    }
}