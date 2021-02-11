import { HTMLAttributes } from "react";
import { RouteLink } from "../../../components/NavLink";
import AlbumArt from "../AlbumArt";

type ItemBookmarkWidgetProps = HTMLAttributes<HTMLDivElement> & {
    device: string;
    id: string;
    title: string;
    icon: string;
};

export default function ({ device, id, title, icon }: ItemBookmarkWidgetProps) {
    return <div className="card shadow">
        <RouteLink to={`/upnp/${device}/browse/${id}`} className="p-0 text-decoration-none">
            <div className="card-body d-flex align-items-center">
                <AlbumArt albumArts={icon ? [icon] : undefined} itemClass="" />
                <span className="text-truncate ms-1">{title}</span>
            </div>
        </RouteLink>
    </div>;
}