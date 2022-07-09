import { HTMLAttributes } from "react";
import { viaProxy } from "../../../components/Extensions";
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
    return <RouteLink to={`/${category}/${device}`} className="hstack flex-fill min-w-0 text-decoration-none p-2">
        <img src={iconUrl} className="icon-2x me-2 flex-shrink-0" alt="" />
        <div className="min-w-0">
            <h5 className="mb-0 text-truncate">{name}</h5>
            <p className="mb-0 text-truncate">{description}</p>
        </div>
    </RouteLink>
}