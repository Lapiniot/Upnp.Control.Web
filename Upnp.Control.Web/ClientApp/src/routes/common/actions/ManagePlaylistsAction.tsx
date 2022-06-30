import { DeviceActionProps } from "./Actions";
import { RouteLink } from "../../../components/NavLink";

export function ManagePlaylistsAction({ device, category, className, ...other }: DeviceActionProps) {
    return <RouteLink to={`/umi/${device.udn}/playlists/PL:`} {...other} glyph="symbols.svg#featured_play_list"
        className={`py-0 px-1 text-decoration-none${className ? ` ${className}` : ""}`} title="Manage playlists">Playlists</RouteLink>;
}