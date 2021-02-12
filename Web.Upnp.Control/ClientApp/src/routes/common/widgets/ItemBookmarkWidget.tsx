import { HTMLAttributes } from "react";
import { RouteLink } from "../../../components/NavLink";
import AlbumArt from "../AlbumArt";

type ItemBookmarkWidgetProps = HTMLAttributes<HTMLDivElement> & {
    device: string;
    deviceName: string;
    id: string;
    title: string;
    icon: string;
};

export default function ({ device, id, title, icon, deviceName }: ItemBookmarkWidgetProps) {
    return <div className="card shadow">
        <RouteLink to={`/upnp/${device}/browse/${id}`} className="p-0 text-decoration-none">
            <div className="card-body d-flex align-items-center">
                <AlbumArt albumArts={icon ? [icon] : undefined} itemClass="" />
                <div className="d-flex flex-wrap overflow-hidden">
                    <span className="text-truncate ms-1">{title}</span>
                    <span className="text-truncate ms-1">(on {deviceName})</span>
                </div>
            </div>
        </RouteLink>
    </div>;
}