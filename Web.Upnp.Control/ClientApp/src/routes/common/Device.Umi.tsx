import { ComponentType, HTMLAttributes } from "react";
import PlayerWidget from "./PlayerWidget";
import { BrowseFetchResult, DataSourceProps, UpnpDevice } from "./Types";
import $api from "../../components/WebApi";
import { DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import AlbumArt from "./AlbumArt";
import { BrowseContentAction, DeviceActionProps, ManagePlaylistsAction } from "./Device.Actions";
import { DeviceCard } from "./DeviceCard";
import { DropdownMenu } from "../../components/DropdownMenu";

function MicroLoader() {
    return <span><i className="fas fa-spinner fa-spin" /></span>
}

function playUrlHandler(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    const url = e.currentTarget.dataset["playUrl"];
    const device = e.currentTarget.parentElement?.parentElement?.dataset["device"];
    if (device && url) $api.control(device).playUri(url).fetch();
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function Menu({ dataContext: d, device }: HTMLAttributes<HTMLDivElement> & DataFetchProps<BrowseFetchResult> & DeviceActionProps) {
    return <div className="btn-group">
        <a href="#0" className="nav-link p-0 px-1" data-bs-toggle="dropdown" aria-expanded="false" title="Quick switch playlists">
            <i className="fas fa-caret-right fa-lg" /><span className="visually-hidden">Toggle Dropdown</span>
        </a>
        <DropdownMenu data-device={device.udn} placement="right-start">
            {d?.source.items.map(i => <li key={i.id}>
                <a className="dropdown-item" href="#" data-play-url={i.res?.url + "#play"} onClick={playUrlHandler}>
                    <AlbumArt itemClass={i.class} albumArts={i.albumArts} className="album-art-sm me-1 align-middle" />{i.title}</a>
            </li>)}
        </DropdownMenu>
    </div>
}

const builder = ({ device: { udn } }: { device: UpnpDevice }) => withMemoKey($api.browse(udn).get("PL:").withResource().withVendor().jsonFetch, udn);

const PlaylistMenu = withDataFetch(Menu, builder, { template: MicroLoader });

const umiActions: [string, ComponentType<DeviceActionProps>][] =
    [["browse", BrowseContentAction], ["playlists", ManagePlaylistsAction], ["quick-playlist", PlaylistMenu]];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    return <DeviceCard {...props} actions={umiActions}>
        <PlayerWidget udn={props["data-source"].udn} />
    </DeviceCard>;
}
