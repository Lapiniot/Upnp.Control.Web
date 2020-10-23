import React from "react";

export default ({ icons = [], service, alt = "" }) => {
    const icon = getOptimalIcon(icons);
    return icon
        ? <img src={icon?.url} className="upnp-dev-icon" alt={alt} />
        : <svg className="upnp-dev-icon">
            <use href={getFallbackIcon(service)} />
        </svg>;
}

function getOptimalIcon(icons, preferredSize = 48) {
    return icons?.sort((i1, i2) => i1.w - i2.w)?.find(i => i.w >= preferredSize) ||
        icons?.sort((i1, i2) => i2.w - i1.w)?.find(i => i.w <= preferredSize);
}

function getFallbackIcon(service) {
    return service?.startsWith("urn:schemas-upnp-org:device:MediaRenderer:")
        ? "device-icon.svg#upnp-renderer"
        : "device-icon.svg#upnp-server";
}
