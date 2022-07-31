import { Icon, UpnpDevice } from "./Types";

type UpnpSpecialRoleIcon = "connected_tv" | "storage" | "devices" | "speaker"

export const enum Services {
    MediaRenderer = "urn:schemas-upnp-org:device:MediaRenderer",
    ContentDirectory = "urn:schemas-upnp-org:service:ContentDirectory",
    UmiPlaylist = "urn:xiaomi-com:service:Playlist"
}

export class UpnpDeviceTools {
    static getCategory(device: UpnpDevice): DeviceCategory {
        return device.services.some(s => s.type.startsWith(Services.UmiPlaylist))
            ? "umi"
            : device.services.some(s => s.type.startsWith(Services.MediaRenderer))
                ? "renderers"
                : "upnp";
    }

    static isUmiDevice(device: UpnpDevice): boolean {
        return device.services.some(s => s.type.startsWith(Services.UmiPlaylist));
    }

    static isMediaServer(device: UpnpDevice): boolean {
        return device.services.some(s => s.type.startsWith(Services.ContentDirectory) || s.type.startsWith(Services.UmiPlaylist));
    }

    static getSpecialRoleIcon(service: string): UpnpSpecialRoleIcon {
        return service?.startsWith(Services.MediaRenderer)
            ? "connected_tv"
            : service?.startsWith(Services.ContentDirectory)
                ? "storage"
                : "devices";
    }

    static getOptimalIcon(icons: Icon[], preferredSize: number = 48): Icon | null {
        return icons?.sort((i1, i2) => i1.w - i2.w)?.find(i => i.w >= preferredSize) ||
            icons?.sort((i1, i2) => i2.w - i1.w)?.find(i => i.w <= preferredSize) || null;
    }
}