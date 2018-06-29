import React from "react";
import DataView from "../DataView";

class DIDLItem extends React.Component {
    render() {
        const data = this.props["data-source"];
        return <div>{data.title}</div>;
    }
}

export default class Browser extends React.Component {
    displayName = Browser.name;

    render() {
        return <DataView dataUri={`/api/browse/${this.props.match.params.path}`}
                         containerTemplate="div" itemTemplate={DIDLItem}/>;
    }
}