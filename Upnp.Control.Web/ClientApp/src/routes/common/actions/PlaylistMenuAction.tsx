import { useDataFetch } from "../../../hooks/DataFetch";
import { Menu, MenuItem } from "../../../components/Menu";
import { MicroLoader } from "../../../components/LoadIndicator";
import WebApi from "../../../services/WebApi";
import AlbumArt from "../AlbumArt";
import { DeviceActionProps } from "./Actions";

function playUrlHandler(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const url = e.currentTarget.dataset["playUrl"];
    const device = e.currentTarget.parentElement?.parentElement?.dataset["device"];
    if (device && url) WebApi.control(device).playUri(url).fetch();
}

const fetchPlaylistsAsync = (udn?: string) => udn ? WebApi.browse(udn).get("PL:").withResource().withVendor().json() : undefined

export function PlaylistMenuAction({ className, device, category, ...other }: DeviceActionProps) {
    const { udn } = device ?? {};
    const { fetching, dataContext: { source: { items = undefined } = {} } = {} } = useDataFetch(fetchPlaylistsAsync, udn);
    return <div className={className} {...other}>
        {!fetching
            ? <>
                <button type="button" disabled={!items} className="btn btn-round btn-plain" data-toggle="dropdown" aria-expanded="false" title="Quick switch playlists">
                    <svg><use href="symbols.svg#playlist_play" /></svg>
                </button>
                {device && <Menu data-device={device.udn}>
                    {items?.map(({ title, class: cls, albumArts, res }, index) =>
                        <MenuItem key={index} className="mwc-75" data-play-url={res?.url + "#play"} onClick={playUrlHandler}>
                            <AlbumArt itemClass={cls} albumArts={albumArts} className="rounded-1" hint="player" />
                            <span>{title}</span>
                        </MenuItem>)}
                </Menu>}
            </>
            : <MicroLoader />}
    </div>
}