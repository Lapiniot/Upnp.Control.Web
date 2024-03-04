import { HTMLAttributes } from "react";
import { Link, RouteLink } from "../../../components/NavLink";
import { UpnpDeviceTools as UDT } from "../UpnpDeviceTools";

export type DeviceActionProps = HTMLAttributes<HTMLElement> & {
    device?: Upnp.Device;
    category?: string;
};

export function BrowseContentAction({ device, category, className, ...other }: DeviceActionProps) {
    const isMediaServer = device && UDT.isMediaServer(device);
    const url = isMediaServer ? `/${category}/${device.udn}/browse` : undefined;
    return <RouteLink to={url} glyph="symbols.svg#folder_open"
        className={`text-decoration-none${className ? ` ${className}` : ""}`} {...other}>
        <span>Browse</span>
    </RouteLink>
}

export function DownloadMetadataAction({ device, category, ...other }: DeviceActionProps) {
    return <Link to={device?.url} glyph="symbols.svg#file_download" {...other}>Metadata</Link>;
}