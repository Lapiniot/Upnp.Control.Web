import { Icon, Services, UpnpDevice, UpnpDeviceCategory } from "./Types";

type UpnpSpecialRole = "upnp-renderer" | "upnp-server" | "upnp-generic";

export class UpnpDeviceTools {
    static getCategory(device: UpnpDevice): UpnpDeviceCategory {
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

    static getSpecialRole(service: string): UpnpSpecialRole {
        return service?.startsWith(Services.MediaRenderer)
            ? "upnp-renderer"
            : service?.startsWith(Services.ContentDirectory)
                ? "upnp-server"
                : "upnp-generic";
    }

    static getOptimalIcon(icons: Icon[], preferredSize: number = 48): Icon | null {
        return icons?.sort((i1, i2) => i1.w - i2.w)?.find(i => i.w >= preferredSize) ||
            icons?.sort((i1, i2) => i2.w - i1.w)?.find(i => i.w <= preferredSize) || null;
    }
}