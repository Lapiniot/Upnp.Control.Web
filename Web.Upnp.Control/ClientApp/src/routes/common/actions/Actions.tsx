import React, { HTMLAttributes } from "react";
import { NavLink, RouteLink } from "../../../components/NavLink";
import { Services, UpnpDevice } from "../Types";

export type DeviceActionProps = HTMLAttributes<HTMLElement> & {
    device: UpnpDevice;
    category?: string;
};

export function BrowseContentAction({ device, category, className, ...other }: DeviceActionProps) {
    const isMediaServer = device.services && device.services.some(
        s => s.type.startsWith(Services.ContentDirectory) || s.type.startsWith(Services.UmiPlaylist));
    return isMediaServer
        ? <RouteLink to={`/${category}/${device.udn}/browse`} glyph="folder" className={`py-0 p-1 nav-link${className ? ` ${className}` : ""}`} {...other}>Browse</RouteLink>
        : null;
}

export function DownloadMetadataAction({ device, category, className, ...other }: DeviceActionProps) {
    return <NavLink to={device.url} glyph="download" className={`py-0 px-1${className ? ` ${className}` : ""}`} {...other}>Metadata</NavLink>;
}