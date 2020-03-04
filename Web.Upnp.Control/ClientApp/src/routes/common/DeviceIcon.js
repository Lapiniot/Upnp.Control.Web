import React from "react";

export default ({ icon, service, alt = "[device icon]" }) => icon
    ? <img src={icon.url} className="upnp-dev-icon align-self-center" alt={alt} />
    : <i className={`fas fa-${service === "urn:schemas-upnp-org:device:MediaRenderer:1" ? "tv" : "server"} upnp-dev-icon align-self-center`} />;