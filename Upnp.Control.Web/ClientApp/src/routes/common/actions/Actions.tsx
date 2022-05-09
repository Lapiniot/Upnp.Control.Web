import { HTMLAttributes } from "react";
import { Link, RouteLink } from "../../../components/NavLink";
import { UpnpDevice } from "../Types";
import { UpnpDeviceTools as UDT } from "../UpnpDeviceTools";

export type DeviceActionProps = HTMLAttributes<HTMLElement> & {
    device: UpnpDevice;
    category?: string;
};

export function BrowseContentAction({ device, category, className, ...other }: DeviceActionProps) {
    const isMediaServer = UDT.isMediaServer(device);
    return isMediaServer
        ? <RouteLink to={`/${category}/${device.udn}/browse`} glyph="sprites.svg#folder-closed" className={`py-0 p-1 nav-link${className ? ` ${className}` : ""}`} {...other}>Browse</RouteLink>
        : null;
}

export function DownloadMetadataAction({ device, category, className, ...other }: DeviceActionProps) {
    return <Link to={device.url} glyph="sprites.svg#download" className={`py-0 px-1${className ? ` ${className}` : ""}`} {...other}>Metadata</Link>;
}