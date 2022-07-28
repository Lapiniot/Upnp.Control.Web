import { DeviceActionProps } from "./Actions";
import { RouteLink } from "../../../components/NavLink";

export function ManagePlaylistsAction({ device, category, className, ...other }: DeviceActionProps) {
    return <RouteLink to={device ? `/umi/${device.udn}/playlists/PL:` : undefined}
        className={`text-decoration-none${className ? ` ${className}` : ""}`}
        {...other} glyph="symbols.svg#featured_play_list" title="Manage playlists">Playlists</RouteLink>
}