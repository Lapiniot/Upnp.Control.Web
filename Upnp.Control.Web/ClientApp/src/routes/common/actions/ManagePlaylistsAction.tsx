import React from "react";
import { DeviceActionProps } from "./Actions";
import { RouteLink } from "../../../components/NavLink";

export function ManagePlaylistsAction({ device, category, className, ...other }: DeviceActionProps) {
    return <RouteLink to={`/${category}/${device.udn}/playlists/PL:`} {...other} glyph="list-alt"
        className={`py-0 px-1 nav-link${className ? ` ${className}` : ""}`} title="Manage playlists">Playlists</RouteLink>;
}