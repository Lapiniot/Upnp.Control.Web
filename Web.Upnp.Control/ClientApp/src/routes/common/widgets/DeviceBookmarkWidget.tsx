import { HTMLAttributes } from "react";
import { getSafeContentUrl } from "../../../components/Extensions";
import { RouteLink } from "../../../components/NavLink";

type DeviceBookmarkWidgetProps = HTMLAttributes<HTMLDivElement> & {
    category: string;
    device: string;
    name: string;
    description: string;
    icon: string;
};

export default function ({ category, device, name, description, icon }: DeviceBookmarkWidgetProps) {
    const iconUrl = icon.startsWith("http") ? getSafeContentUrl(icon) : icon;
    return <RouteLink to={`/${category}/${device}`} className="d-flex text-decoration-none p-2">
        <img src={iconUrl} className="upnp-dev-icon me-2" alt="" />
        <div className="overflow-hidden">
            <h5 className="mb-0 text-truncate">{name}</h5>
            <p className="mb-0 text-truncate">{description}</p>
        </div>
    </RouteLink>
}