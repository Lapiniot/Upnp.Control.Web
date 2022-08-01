import { ImgHTMLAttributes } from "react";
import { viaProxy } from "../../components/Extensions";
import { UpnpDeviceTools as UDT } from "./UpnpDeviceTools";

type DeviceIconProps = ImgHTMLAttributes<HTMLImageElement> & {
    device: Upnp.Device | null | undefined;
}

export default ({ device, className, ...props }: DeviceIconProps) => {
    const { icons, type } = device ?? {};
    const icon = icons && UDT.getOptimalIcon(icons);
    return <img src={icons && (icon ? viaProxy(icon.url) : `stack.svg#${UDT.getSpecialRoleIcon(type!)}`)}
        className={`icon icon-3x me-2${className ? ` ${className}` : ""}`} alt="" {...props} />
}