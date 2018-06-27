import React from "react";

export default class DeviceIcon extends React.Component {
    render() {
        if (this.props.icon) {
            return <img src={this.props.icon.url} className="upnp-dev-icon align-self-center"
                alt={this.props.alt || "[device icon]"} />;
        } else {
            const iconClass = this.props.service === "urn:schemas-upnp-org:device:MediaRenderer:1" ? "tv" : "server";
            return <i className={`fas fa-${iconClass} upnp-dev-icon align-self-center`} />;
        }
    }
}