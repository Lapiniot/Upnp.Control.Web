import { useCallback } from "react";
import { DataFetchProps, useDataFetch } from "../../../components/DataFetch";
import { DropdownMenu } from "../../../components/DropdownMenu";
import { MicroLoader } from "../../../components/LoadIndicator";
import WebApi from "../../../components/WebApi";
import AlbumArt from "../AlbumArt";
import { BrowseFetchResult } from "../Types";
import { DeviceActionProps } from "./Actions";

function playUrlHandler(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    const url = e.currentTarget.dataset["playUrl"];
    const device = e.currentTarget.parentElement?.parentElement?.dataset["device"];
    if (device && url) WebApi.control(device).playUri(url).fetch();
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function Menu({ dataContext: d, device }: DataFetchProps<BrowseFetchResult> & DeviceActionProps) {
    return <>
        <button type="button" className="btn btn-round btn-plain" data-bs-toggle="dropdown" aria-expanded="false" title="Quick switch playlists">
            <svg className="icon"><use href="sprites.svg#music" /></svg>
        </button>
        <DropdownMenu data-device={device.udn} placement="top-end"
            modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
            style={{ overflowY: "auto", maxWidth: "100vw", maxHeight: "calc(100% - 3rem)" }}>
            {d?.source.items?.map(i => <li key={i.id}>
                <a className="dropdown-item" href="#" data-play-url={i.res?.url + "#play"} onClick={playUrlHandler}>
                    <AlbumArt itemClass={i.class} albumArts={i.albumArts} className="album-art align-middle rounded-1" />{i.title}</a>
            </li>)}
        </DropdownMenu>
    </>
}

export function PlaylistMenuAction({ className, device, category, ...other }: DeviceActionProps) {
    const { udn } = device;
    const loader = useCallback(() => WebApi.browse(udn).get("PL:").withResource().withVendor().jsonFetch(), [udn]);
    const data = useDataFetch(loader);
    return <div className={className} {...other}>
        {!data.fetching ? <Menu {...data} device={device} category={category} /> : <MicroLoader />}
    </div>
}