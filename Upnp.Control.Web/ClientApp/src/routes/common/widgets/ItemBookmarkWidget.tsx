import { HTMLAttributes } from "react";
import { RouteLink } from "../../../components/NavLink";
import AlbumArt from "../AlbumArt";

type ItemBookmarkWidgetProps = HTMLAttributes<HTMLDivElement> & {
    device: string;
    deviceName: string;
    id: string;
    title: string;
    icon: string;
    itemClass: string;
};

export default function ({ device, id, title, icon, itemClass, deviceName }: ItemBookmarkWidgetProps) {
    return <RouteLink to={`/upnp/${device}/browse/${id}`} className="hstack flex-1 text-decoration-none rounded-auto overflow-clip">
        <AlbumArt albumArts={icon ? [icon] : undefined} itemClass={itemClass} className="ms-2 icon-3x" />
        <div className="m-2 overflow-clip flex-1" title={`${title} on ${deviceName}`}>
            <h6 className="mb-0 text-truncate">{title}</h6>
            <p className="mb-0 text-truncate small">[{deviceName}]</p>
        </div>
    </RouteLink>
}