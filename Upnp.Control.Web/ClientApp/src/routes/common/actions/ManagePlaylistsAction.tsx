import { DeviceActionProps } from "./Actions";
import { RouteLink } from "../../../components/NavLink";

export function ManagePlaylistsAction({ device, category, className, ...other }: DeviceActionProps) {
    return <RouteLink to={`/umi/${device.udn}/playlists/PL:`} {...other} glyph="sprites.svg#list-alt"
        className={`py-0 px-1 nav-link${className ? ` ${className}` : ""}`} title="Manage playlists">Playlists</RouteLink>;
}