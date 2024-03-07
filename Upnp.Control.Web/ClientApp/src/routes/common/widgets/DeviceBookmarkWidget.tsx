import { HTMLAttributes } from "react";
import { viaProxy } from "../../../services/Extensions";
import { RouteLink } from "../../../components/NavLink";

type DeviceBookmarkWidgetProps = HTMLAttributes<HTMLDivElement> & {
    category: string;
    device: string;
    name: string;
    description: string;
    icon: string;
};

export default function ({ category, device, name, description, icon }: DeviceBookmarkWidgetProps) {
    const iconUrl = icon.startsWith("http") ? viaProxy(icon) : icon;
    return <RouteLink to={`/${category}/${device}`} className="hstack flex-1 text-decoration-none m-1 overflow-clip">
        {iconUrl.includes(".svg")
            ? <svg className="icon-2x ms-2"><use href={iconUrl} /></svg>
            : <img src={iconUrl} className="icon-2x ms-2" alt="" />}
        <div className="p-2 overflow-clip">
            <h5 className="mb-0 text-truncate">{name}</h5>
            <p className="mb-0 text-truncate">{description}</p>
        </div>
    </RouteLink>
}