import { RouteLink } from "@components/NavLink";
import { type DeviceActionProps } from "@routes/common/actions/Actions";

export function ManagePlaylistsAction({ device, category, className, ...other }: DeviceActionProps) {
    return <RouteLink to={device ? `/umi/${device.udn}/playlists/PL:` : undefined}
        className={`btn-icon-link${className ? ` ${className}` : ""}`}
        {...other} icon="symbols.svg#featured_play_list" title="Manage playlists">
        <span className="ms-1">Playlists</span>
    </RouteLink>
}