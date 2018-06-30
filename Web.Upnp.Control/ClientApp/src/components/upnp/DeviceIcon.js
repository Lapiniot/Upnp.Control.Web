import React from "react";

export default class DeviceIcon extends React.Component {

    displayName = DeviceIcon.name;

    render() {
        const { icon, alt = "[device icon]" } = this.props;

        if (icon) {
            return <img src={icon.url} className="upnp-dev-icon align-self-center" alt={alt} />;
        } else {
            const iconClass = this.props.service === "urn:schemas-upnp-org:device:MediaRenderer:1" ? "tv" : "server";
            return <i className={`fas fa-${iconClass} upnp-dev-icon align-self-center`} />;
        }
    }
}