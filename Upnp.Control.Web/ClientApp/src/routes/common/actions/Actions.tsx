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
    return <RouteLink to={url} icon="symbols.svg#folder_open"
        className={`text-decoration-none${className ? ` ${className}` : ""}`} {...other}>
        <span className="ms-1">Browse</span>
    </RouteLink>
}

export function DownloadMetadataAction({ device, category, ...other }: DeviceActionProps) {
    return <Link to={device?.url} icon="symbols.svg#file_download" {...other}>
        <span className="ms-1">Metadata</span>
    </Link>;
}