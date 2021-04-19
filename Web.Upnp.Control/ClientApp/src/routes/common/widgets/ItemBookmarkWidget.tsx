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
    return <RouteLink to={`/upnp/${device}/browse/${id}`} className="d-flex align-items-center text-decoration-none p-2">
        <AlbumArt albumArts={icon ? [icon] : undefined} itemClass="" className="me-2" />
        <div className="d-flex flex-column overflow-hidden" title={`${title} on ${deviceName}`}>
            <h6 className="mb-0 text-truncate">{title}</h6>
            <p className="mb-0 text-truncate small">[on {deviceName}]</p>
        </div>
    </RouteLink>
}