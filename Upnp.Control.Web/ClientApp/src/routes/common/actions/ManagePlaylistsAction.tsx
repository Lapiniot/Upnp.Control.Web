import { DeviceActionProps } from "./Actions";
import { RouteLink } from "../../../components/NavLink";

export function ManagePlaylistsAction({ device, category, className, ...other }: DeviceActionProps) {
    return <RouteLink to={device ? `/umi/${device.udn}/playlists/PL:` : undefined}
        className={`text-decoration-none${className ? ` ${className}` : ""}`}
        {...other} icon="symbols.svg#featured_play_list" title="Manage playlists">
        <span className="ms-1">Playlists</span>
    </RouteLink>
}