import React from "react";
import DataView from "../DataView";

export default class UmiDevices extends React.Component {

    displayName = UmiDevices.name;

    render() {
        return <DataView dataUri="/api/discovery"
                         containerTemplate={"div"}
                         containerProps={{ className: "grid" }}
                         itemTemplate="div" />;
    }
}