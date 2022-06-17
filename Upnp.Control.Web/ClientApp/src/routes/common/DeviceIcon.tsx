import { ImgHTMLAttributes } from "react";
import { viaProxy } from "../../components/Extensions";
import { UpnpDevice } from "./Types";
import { UpnpDeviceTools as UDT } from "./UpnpDeviceTools";

export default ({ device: { icons, type } }: { device: UpnpDevice }) => {
    const icon = UDT.getOptimalIcon(icons);
    const attr: ImgHTMLAttributes<HTMLImageElement> = icon
        ? { src: viaProxy(icon.url) }
        : { src: `icons.svg#${UDT.getSpecialRole(type)}`, style: { objectFit: "unset" } };
    return <img {...attr} className="upnp-dev-icon me-2" alt="" />;
}