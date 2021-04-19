import { HTMLAttributes } from "react";
import { RouteLink } from "../../../components/NavLink";

type DeviceBookmarkWidgetProps = HTMLAttributes<HTMLDivElement> & {
    category: string;
    device: string;
    name: string;
    description: string;
    icon: string;
};

export default function ({ category, device, name, description, icon }: DeviceBookmarkWidgetProps) {
    return <RouteLink to={`/${category}/${device}`} className="d-flex text-decoration-none p-2">
        <img src={icon} className="upnp-dev-icon me-2" alt="" />
        <div className="overflow-hidden">
            <h5 className="mb-0 text-truncate">{name}</h5>
            <p className="mb-0 text-truncate">{description}</p>
        </div>
    </RouteLink>
}