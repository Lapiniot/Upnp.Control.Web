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
        ? <RouteLink to={`/${category}/${device.udn}/browse`} glyph="symbols.svg#folder_open" className={`text-decoration-none${className ? ` ${className}` : ""}`} {...other}>Browse</RouteLink>
        : null;
}

export function DownloadMetadataAction({ device, category, ...other }: DeviceActionProps) {
    return <Link to={device.url} glyph="symbols.svg#file_download" {...other}>Metadata</Link>;
}