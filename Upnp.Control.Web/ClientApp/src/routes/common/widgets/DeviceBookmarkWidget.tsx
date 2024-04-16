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
    return <RouteLink to={`/${category}/${device}`} className="card-horizontal"
        title={`${name}\r\n\xab${description}\xbb`}>
        {iconUrl.includes(".svg")
            ? <svg><use href={iconUrl} /></svg>
            : <img src={iconUrl} alt="" />}
        <div>
            <h6 className="mb-0 text-truncate">{name}</h6>
            <p className="mb-0 text-truncate small">{description}</p>
        </div>
    </RouteLink>
}