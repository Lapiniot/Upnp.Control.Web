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
    return <div className="card shadow-sm">
        <RouteLink to={`/upnp/${device}/browse/${id}`} className="p-0 text-decoration-none">
            <div className="card-body d-flex align-items-center">
                <AlbumArt albumArts={icon ? [icon] : undefined} itemClass="" className="me-3" />
                <div className="d-flex flex-wrap overflow-hidden" title={`${title} on ${deviceName}`}>
                    <h6 className="card-title text-truncate flex-basis-100">{title}</h6>
                    <p className="card-subtitle text-truncate small">[on {deviceName}]</p>
                </div>
            </div>
        </RouteLink>
    </div>;
}