import { ImgHTMLAttributes, SVGProps } from "react";
import { viaProxy } from "../../services/Extensions";
import { UpnpDeviceTools as UDT } from "./UpnpDeviceTools";

type CommonKeys<K, V> = { [P in keyof K & keyof V]: K[P] extends V[P] ? V[P] extends K[P] ? P : never : never }[keyof K & keyof V]
type Common<K, V> = { [P in CommonKeys<K, V>]: K[P] }
type ImgOrSvgCommonProps = Partial<Common<ImgHTMLAttributes<HTMLImageElement>, SVGProps<SVGElement>>>
type DeviceIconProps = ImgOrSvgCommonProps & { device: Upnp.Device | null | undefined }

export default ({ device, className, ...props }: DeviceIconProps) => {
    const { icons, type } = device ?? {};
    const icon = icons && UDT.getOptimalIcon(icons);
    const iconClass = `icon icon-3x me-2${className ? ` ${className}` : ""}`;
    return icon
        ? <img src={viaProxy(icon.url)} className={iconClass} alt="" {...props} />
        : <svg className={iconClass} {...props}><use href={`stack.svg#${UDT.getSpecialRoleIcon(type!)}`} /></svg>
}