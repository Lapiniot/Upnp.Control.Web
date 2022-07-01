import { viaProxy } from "../../components/Extensions";
import { UpnpDevice } from "./Types";
import { UpnpDeviceTools as UDT } from "./UpnpDeviceTools";

export default ({ device: { icons, type } }: { device: UpnpDevice }) => {
    const icon = UDT.getOptimalIcon(icons);
    return <img src={icon ? viaProxy(icon.url) : `stack.svg#${UDT.getSpecialRoleIcon(type)}`} className="icon icon-3x me-2" alt="" />;
}