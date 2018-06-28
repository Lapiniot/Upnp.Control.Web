import React from "react";
import DataView from "../DataView";

export default class Browser extends React.Component {
    displayName = Browser.name;

    render() {
        return <DataView dataUri={`/api/browse/${this.props.match.params.path}`}
                         containerTemplate="div" itemTemplate="div"/>;
    }
}