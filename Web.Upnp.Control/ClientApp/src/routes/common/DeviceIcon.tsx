import { Icon, Services } from "./Types";

export function getOptimalIcon(icons: Icon[], preferredSize: number = 48): Icon | null {
    return icons?.sort((i1, i2) => i1.w - i2.w)?.find(i => i.w >= preferredSize) ||
        icons?.sort((i1, i2) => i2.w - i1.w)?.find(i => i.w <= preferredSize) || null;
}

export function getFallbackIcon(service: string): string {
    return service?.startsWith(Services.MediaRenderer) ? "icons.svg#upnp-renderer" : "icons.svg#upnp-server";
}

export default ({ icons = [], service }: { icons: Icon[], service: string }) => {
    const icon = getOptimalIcon(icons);
    const attr: object = icon ? { src: icon.url } : { src: getFallbackIcon(service), style: { objectFit: "unset" } };
    return <img {...attr} className="upnp-dev-icon" alt="" />;
}
