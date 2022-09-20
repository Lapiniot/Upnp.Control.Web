import { useDataFetch } from "../../../components/DataFetch";
import { DropdownMenu } from "../../../components/DropdownMenu";
import { MicroLoader } from "../../../components/LoadIndicator";
import WebApi from "../../../components/WebApi";
import AlbumArt from "../AlbumArt";
import { DeviceActionProps } from "./Actions";

function playUrlHandler(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    const url = e.currentTarget.dataset["playUrl"];
    const device = e.currentTarget.parentElement?.parentElement?.dataset["device"];
    if (device && url) WebApi.control(device).playUri(url).fetch();
    e.preventDefault();
    e.stopPropagation();
    return false;
}

const fetchPlaylistsAsync = (udn?: string) => udn ? WebApi.browse(udn).get("PL:").withResource().withVendor().json() : undefined

export function PlaylistMenuAction({ className, device, category, ...other }: DeviceActionProps) {
    const { udn } = device ?? {};
    const { fetching, dataContext: { source: { items = undefined } = {} } = {} } = useDataFetch(fetchPlaylistsAsync, udn);
    return <div className={className} {...other}>
        {!fetching
            ? <>
                <button type="button" disabled={!items} className="btn btn-round btn-plain" data-bs-toggle="dropdown" aria-expanded="false" title="Quick switch playlists">
                    <svg><use href="symbols.svg#playlist_play" /></svg>
                </button>
                {device && <DropdownMenu data-device={device.udn} placement="top-end"
                    modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
                    style={{ overflowY: "auto", maxWidth: "100vw", maxHeight: "calc(100% - 3rem)" }}>
                    {items?.map(({ title, class: cls, albumArts, res }, index) => <li key={index}>
                        <a className="dropdown-item" href="#" data-play-url={res?.url + "#play"} onClick={playUrlHandler}>
                            <AlbumArt itemClass={cls} albumArts={albumArts} className="rounded-1" hint="player" />
                            <span>{title}</span>
                        </a>
                    </li>)}
                </DropdownMenu>}
            </>
            : <MicroLoader />}
    </div>
}