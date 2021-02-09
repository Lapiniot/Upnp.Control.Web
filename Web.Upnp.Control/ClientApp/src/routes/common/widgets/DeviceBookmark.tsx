import { HTMLAttributes } from "react";
import { RouteLink } from "../../../components/NavLink";

type DeviceBookmarkProps = HTMLAttributes<HTMLDivElement> & {
    category: string;
    device: string;
    name: string;
    description: string;
    icon: string;
};

export default function ({ category, device, name, description, icon }: DeviceBookmarkProps) {
    return <div className="card shadow">
        <RouteLink to={`/${category}/${device}`} className="p-0 text-decoration-none">
            <div className="card-body d-flex align-items-center">
                <img src={icon} className="upnp-dev-icon" alt="" />
                <div className="overflow-hidden">
                    <h5 className="card-title text-truncate">{name}</h5>
                    <p className="card-text text-truncate">{description}</p>
                </div>
            </div>
        </RouteLink>
    </div>;
}