import { Icon, Services, UpnpDevice, UpnpDeviceCategory } from "./Types";

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

    static getFallbackIcon(service: string): string {
        return service?.startsWith(Services.MediaRenderer)
            ? "icons.svg#upnp-renderer"
            : "icons.svg#upnp-server";
    }

    static getOptimalIcon(icons: Icon[], preferredSize: number = 48): Icon | null {
        return icons?.sort((i1, i2) => i1.w - i2.w)?.find(i => i.w >= preferredSize) ||
            icons?.sort((i1, i2) => i2.w - i1.w)?.find(i => i.w <= preferredSize) || null;
    }
}