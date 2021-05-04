import { DeviceActionProps } from "./Actions";
import $api from "../../../components/WebApi";
import { DataFetchProps, withDataFetch, withMemoKey } from "../../../components/DataFetch";
import { BrowseFetchResult, UpnpDevice } from "../Types";
import React from "react";
import AlbumArt from "../AlbumArt";
import { DropdownMenu } from "../../../components/DropdownMenu";
import { MicroLoader } from "../../../components/LoadIndicator";

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
            <svg className="icon"><use href="#music" /></svg>
        </button>
        <DropdownMenu className="mw-100" data-device={device.udn} placement="top-end"
            style={{ overflowY: "auto", maxHeight: "calc(100% - 2.5rem)" }}>
            {d?.source.items?.map(i => <li key={i.id}>
                <a className="dropdown-item text-truncate" href="#" data-play-url={i.res?.url + "#play"} onClick={playUrlHandler}>
                    <AlbumArt itemClass={i.class} albumArts={i.albumArts} className="album-art-sm align-middle" />{i.title}</a>
            </li>)}
        </DropdownMenu>
    </>
}

const builder = ({ device: { udn } }: { device: UpnpDevice }) => withMemoKey($api.browse(udn).get("PL:").withResource().withVendor().jsonFetch, udn);

export const PlaylistMenu = withDataFetch(Menu, builder, { template: MicroLoader });

export function PlaylistMenuAction({ className, device, category, ...other }: DeviceActionProps) {
    return <div className={className} {...other}>
        <PlaylistMenu device={device} category={category} />
    </div>;
}