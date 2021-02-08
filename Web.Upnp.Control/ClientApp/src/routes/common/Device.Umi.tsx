import React from "react";
import PlayerWidget from "./PlayerWidget";
import { BrowseFetchResult, DataSourceProps, UpnpDevice } from "./Types";
import $api from "../../components/WebApi";
import { DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import AlbumArt from "./AlbumArt";
import { BrowseContentAction, DeviceActionProps, OpenAudioAction } from "./Device.Actions";
import { ActionDescriptor, DeviceCard } from "./DeviceCard";
import { DropdownMenu } from "../../components/DropdownMenu";
import { MicroLoader } from "../../components/LoadIndicator";
import { RouteLink } from "../../components/NavLink";

function ManagePlaylistsAction({ device, category, className, ...other }: DeviceActionProps) {
    return <RouteLink to={`/${category}/${device.udn}/playlists/PL:`} {...other} glyph="list-alt"
        className={`py-0 px-1 nav-link${className ? ` ${className}` : ""}`} title="Manage playlists">Playlists</RouteLink>
}

function playUrlHandler(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    const url = e.currentTarget.dataset["playUrl"];
    const device = e.currentTarget.parentElement?.parentElement?.dataset["device"];
    if (device && url) $api.control(device).playUri(url).fetch();
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function Menu({ dataContext: d, device }: DataFetchProps<BrowseFetchResult> & DeviceActionProps) {
    return <>
        <button type="button" className="btn btn-round btn-plain" data-bs-toggle="dropdown" aria-expanded="false" title="Quick switch playlists">
            <svg className="icon"><use href="#music" /></svg><span className="visually-hidden">Toggle Dropdown</span>
        </button>
        <DropdownMenu data-device={device.udn} placement="bottom-end">
            {d?.source.items.map(i => <li key={i.id}>
                <a className="dropdown-item" href="#" data-play-url={i.res?.url + "#play"} onClick={playUrlHandler}>
                    <AlbumArt itemClass={i.class} albumArts={i.albumArts} className="album-art-sm me-1 align-middle" />{i.title}</a>
            </li>)}
        </DropdownMenu>
    </>
}

const builder = ({ device: { udn } }: { device: UpnpDevice }) => withMemoKey($api.browse(udn).get("PL:").withResource().withVendor().jsonFetch, udn);

const PlaylistMenu = withDataFetch(Menu, builder, { template: MicroLoader });

function PlaylistMenuAction({ className, device, category, ...other }: DeviceActionProps) {
    return <div className={className} {...other}>
        <PlaylistMenu device={device} category={category} />
    </div>;
}

const umiActions: ActionDescriptor[] = [
    ["browse", BrowseContentAction],
    ["playlists", ManagePlaylistsAction],
    ["quick-playlist", PlaylistMenuAction, { className: "m-0 ms-auto" }],
    ["open", OpenAudioAction, { className: "m-0" }]
];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    return <DeviceCard {...props} actions={umiActions}>
        <PlayerWidget udn={props["data-source"].udn} />
    </DeviceCard>;
}
